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
  }): Promise<Todo> {
    try {
      const todo = await this.todoRepository.create(data.todo);

      const itemsWithTodoId = data.items.map(item => ({
        ...item,
        todoId: todo.id,
      }));

      await this.itemRepository.createAll(itemsWithTodoId);

      const result = await this.todoRepository.findById(todo.id);
      const items = await this.itemRepository.find({
        where: { todoId: todo.id },
      });

      return {
        ...result.toJSON(),
        items: items,
      } as Todo;
    } catch (error) {
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

  // 更新 Todo 狀態
  public async updateTodoStatus(
    id: number,
    status: 'ACTIVE' | 'INACTIVE',
  ): Promise<void> {
    await this.todoRepository.updateById(id, { status });
  }

  // 軟刪除 Todo
  public async deleteTodo(id: number): Promise<void> {
    await this.todoRepository.softDelete(id);
  }
}
