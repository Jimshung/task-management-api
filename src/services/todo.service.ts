import { inject, injectable /* inject */ } from '@loopback/core';
import { repository } from '@loopback/repository';
import { MysqlDataSource } from '../datasources';
import { ApiError, ErrorCodes } from '../errors/api-error';
import { Item, Todo } from '../models';
import { ItemRepository } from '../repositories/item.repository';
import { TodoRepository } from '../repositories/todo.repository';

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
  async createTodoWithItems(
    todo: Omit<Todo, 'id'>,
    items: Omit<Item, 'id' | 'todo_id'>[],
  ): Promise<Todo> {
    // 開始事務
    const transaction = await this.dataSource.beginTransaction();

    try {
      // 在事務中創建 Todo
      const newTodo = await this.todoRepository.create(todo, {
        transaction,
      });

      if (items && items.length > 0) {
        const itemsWithTodoId = items.map(item => ({
          ...item,
          todo_id: newTodo.id,
        }));
        // 在同一個事務中創建 Items
        await this.itemRepository.createAll(itemsWithTodoId, {
          transaction,
        });
      }

      // 提交事務
      await transaction.commit();

      // 返回完整的 Todo（包含關聯的 items）
      return this.todoRepository.findById(newTodo.id, {
        include: ['items'],
      });
    } catch (error) {
      // 如果發生錯誤，回滾事務
      await transaction.rollback();
      throw error;
    }
  }

  // 取得 Todo 列表（支援分���和過濾）
  async findTodos(filter?: {
    status?: 'ACTIVE' | 'INACTIVE';
    page?: number;
    limit?: number;
  }) {
    try {
      const limit = filter?.limit ?? 10;
      const skip = filter?.page ? (filter.page - 1) * limit : 0;

      const whereClause = {
        deleted_at: { eq: undefined },
        ...(filter?.status && { status: filter.status }),
      };

      const todos = await this.todoRepository.find({
        where: whereClause,
        include: ['items'],
        limit,
        skip,
      });

      if (!todos.length && filter?.page && filter.page > 1) {
        throw new ApiError(404, '找不到更多數據', ErrorCodes.NOT_FOUND, {
          page: filter.page,
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
  async updateTodoStatus(
    id: number,
    status: 'ACTIVE' | 'INACTIVE',
  ): Promise<void> {
    await this.todoRepository.updateById(id, { status });
  }

  // 軟刪除 Todo
  async deleteTodo(id: number): Promise<void> {
    await this.todoRepository.softDelete(id);
  }
}
