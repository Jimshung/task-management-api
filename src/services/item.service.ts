import { injectable } from '@loopback/core';
import { repository } from '@loopback/repository';
import { ApiError, ErrorCodes } from '../errors';
import { Item } from '../models';
import { ItemRepository, TodoRepository } from '../repositories';

@injectable()
export class ItemService {
  constructor(
    @repository(ItemRepository)
    private itemRepository: ItemRepository,
    @repository(TodoRepository)
    private todoRepository: TodoRepository,
  ) {}

  public async updateItemCompletion(
    id: number,
    isCompleted: boolean,
  ): Promise<void> {
    try {
      const item = await this.itemRepository.findById(id);
      if (!item) {
        throw new ApiError(404, '找不到該項目', ErrorCodes.NOT_FOUND);
      }

      const updateData: Partial<Item> = {
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date() : undefined,
      };

      await this.itemRepository.updateById(id, updateData);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        500,
        '更新項目狀態失敗',
        ErrorCodes.DATABASE_ERROR,
        error,
      );
    }
  }

  public async bulkUpdateCompletion(
    ids: number[],
    isCompleted: boolean,
  ): Promise<void> {
    try {
      const items = await this.itemRepository.find({
        where: {
          id: { inq: ids },
        },
      });

      if (items.length !== ids.length) {
        throw new ApiError(400, '部分項目不存在', ErrorCodes.VALIDATION_ERROR);
      }

      const updateData: Partial<Item> = {
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date() : undefined,
      };

      await Promise.all(
        ids.map(id => this.itemRepository.updateById(id, updateData)),
      );
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        500,
        '批量更新項目狀態失敗',
        ErrorCodes.DATABASE_ERROR,
        error,
      );
    }
  }

  public async findItemsByTodoId(
    todoId: number,
    filter?: {
      isCompleted?: boolean;
    },
  ): Promise<Item[]> {
    try {
      const todo = await this.todoRepository.findOne({
        where: {
          id: todoId,
          deletedAt: undefined,
        },
      });

      if (!todo) {
        throw new ApiError(404, '找不到該待辦事項', ErrorCodes.NOT_FOUND);
      }

      const whereClause = {
        todoId,
        ...(filter?.isCompleted !== undefined && {
          is_completed: filter.isCompleted,
        }),
      };

      const items = await this.itemRepository.find({
        where: whereClause,
        order: ['id ASC'],
      });

      return items;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        500,
        '獲取項目列表失敗',
        ErrorCodes.DATABASE_ERROR,
        error,
      );
    }
  }

  public async findById(id: number): Promise<Item> {
    try {
      const exists = await this.itemRepository.exists(id);
      if (!exists) {
        throw new ApiError(404, '找不到該項目', ErrorCodes.NOT_FOUND, {
          id,
        });
      }
      return await this.itemRepository.findById(id);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, '獲取項目失敗', ErrorCodes.DATABASE_ERROR, error);
    }
  }

  public async create(item: Omit<Item, 'id'>): Promise<Item> {
    try {
      return await this.itemRepository.create(item);
    } catch (error) {
      throw new ApiError(500, '創建項目失敗', ErrorCodes.DATABASE_ERROR, error);
    }
  }

  public async updateById(id: number, item: Partial<Item>): Promise<Item> {
    try {
      const exists = await this.itemRepository.exists(id);
      if (!exists) {
        throw new ApiError(404, '找不到要更新的項目', ErrorCodes.NOT_FOUND, {
          id,
        });
      }

      // 如果更新包含 is_completed，自動處理 completed_at
      if (item.is_completed !== undefined) {
        item.completed_at = item.is_completed ? new Date() : undefined;
      }

      await this.itemRepository.updateById(id, item);
      return await this.findById(id);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, '更新項目失敗', ErrorCodes.DATABASE_ERROR, error);
    }
  }

  public async deleteById(id: number): Promise<void> {
    try {
      const exists = await this.itemRepository.exists(id);
      if (!exists) {
        throw new ApiError(404, '找不到要刪除的項目', ErrorCodes.NOT_FOUND, {
          id,
        });
      }

      await this.itemRepository.deleteById(id);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, '刪除項目失敗', ErrorCodes.DATABASE_ERROR, error);
    }
  }
}
