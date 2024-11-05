import { inject, injectable } from '@loopback/core';
import { repository, Where } from '@loopback/repository';
import { MysqlDataSource } from '../datasources';
import { ApiError, ErrorCodes } from '../errors';
import { Item, Todo } from '../models';
import { ItemRepository, TodoRepository } from '../repositories';

@injectable()
export class TodoService {
  constructor(
    @repository(TodoRepository)
    private todoRepository: TodoRepository,
    @repository(ItemRepository)
    private itemRepository: ItemRepository,
    @inject('datasources.mysql')
    private dataSource: MysqlDataSource,
  ) {}

  // 創建 Todo 並同時創建多個 Items
  public async createTodoWithItems(data: {
    todo: Partial<Todo>;
    items: Partial<Item>[];
  }): Promise<{ todo: Todo; items: Item[] }> {
    try {
      // 先創建 todo
      const todo = await this.todoRepository.create(data.todo);

      const itemsWithTodoId = data.items.map(item => ({
        ...item,
        todoId: todo.id,
      }));

      // 創建關聯的 items
      const items = await this.itemRepository.createAll(itemsWithTodoId);

      return {
        todo: todo,
        items: items,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        500,
        '創建待辦事項失敗',
        ErrorCodes.DATABASE_ERROR,
        error,
      );
    }
  }

  // 取得 Todo 列表（支援分頁和過濾）
  public async findTodos(params: {
    status?: 'ACTIVE' | 'INACTIVE';
    page?: number;
    limit?: number;
  }): Promise<Todo[]> {
    try {
      const limit = params?.limit ?? 10;
      const skip = params?.page ? (params.page - 1) * limit : 0;

      const whereClause: Where<Todo> = {
        and: [
          { deletedAt: undefined },
          ...(params?.status ? [{ status: params.status }] : []),
        ],
      };

      const todos = await this.todoRepository.find({
        where: whereClause,
        include: ['items'],
        limit,
        skip,
      });

      if (!todos.length && params?.page && params.page > 1) {
        throw new ApiError(404, '找不到更多數據', ErrorCodes.NOT_FOUND, {
          page: params.page,
        });
      }

      return todos;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        500,
        '獲取待辦事項列表失敗',
        ErrorCodes.DATABASE_ERROR,
        error,
      );
    }
  }

  // 軟刪除 Todo
  public async deleteTodo(id: number): Promise<void> {
    try {
      const todo = await this.todoRepository.findById(id);
      if (!todo) {
        throw new ApiError(404, '找不到該待辦事項', ErrorCodes.NOT_FOUND, {
          id,
        });
      }

      // 執行軟刪除
      await this.todoRepository.updateById(id, {
        deletedAt: new Date(),
      });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        500,
        '刪除待辦事項失敗',
        ErrorCodes.DATABASE_ERROR,
        error,
      );
    }
  }

  public async findTodoById(id: number): Promise<Todo | null> {
    try {
      const todo = await this.todoRepository.findOne({
        where: {
          id: id,
        },
        include: [
          {
            relation: 'items',
            scope: {
              order: ['id ASC'],
            },
          },
        ],
      });

      if (!todo || todo.deletedAt) {
        throw new ApiError(404, '找不到該待辦事項', ErrorCodes.NOT_FOUND, {
          id,
        });
      }

      return todo;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        500,
        '查詢待辦事項失敗',
        ErrorCodes.DATABASE_ERROR,
        error,
      );
    }
  }

  public async updateTodo(id: number, data: Partial<Todo>): Promise<void> {
    try {
      const existingTodo = await this.todoRepository.findOne({
        where: {
          id: id,
          deletedAt: undefined,
        },
      });

      if (!existingTodo) {
        throw new ApiError(404, '找不到該待辦事項', ErrorCodes.NOT_FOUND);
      }

      if (data.status && !['ACTIVE', 'INACTIVE'].includes(data.status)) {
        throw new ApiError(400, '無效的狀態值', ErrorCodes.VALIDATION_ERROR);
      }

      await this.todoRepository.updateById(id, data);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        500,
        '更新待辦事項失敗',
        ErrorCodes.DATABASE_ERROR,
        error,
      );
    }
  }
}
