import { injectable } from '@loopback/core';
import { repository } from '@loopback/repository';
import { ApiError, ErrorCodes } from '../errors/api-error';
import { Item } from '../models';
import { ItemRepository } from '../repositories/item.repository';

@injectable()
export class ItemService {
  constructor(
    @repository(ItemRepository)
    private itemRepository: ItemRepository,
  ) {}

  // 更新項目完成狀態
  async updateItemCompletion(id: number, isCompleted: boolean): Promise<void> {
    try {
      const item = await this.itemRepository.findById(id);
      if (!item) {
        throw new ApiError(404, '找不到該項目', ErrorCodes.NOT_FOUND);
      }

      const updateData: Partial<Item> = {
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : undefined,
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

  // 批量更新項目狀態
  async bulkUpdateCompletion(
    ids: number[],
    isCompleted: boolean,
  ): Promise<void> {
    try {
      // 檢查所有項目是否存在
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
        completed_at: isCompleted ? new Date().toISOString() : undefined,
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

  // 取得特定 Todo 的所有項目
  async findItemsByTodoId(
    todoId: number,
    filter?: {
      isCompleted?: boolean;
    },
  ): Promise<Item[]> {
    try {
      const whereClause = {
        todo_id: todoId,
        ...(filter?.isCompleted !== undefined && {
          is_completed: filter.isCompleted,
        }),
      };

      return this.itemRepository.find({
        where: whereClause,
      });
    } catch (error) {
      throw new ApiError(
        500,
        '獲取項目列表失敗',
        ErrorCodes.DATABASE_ERROR,
        error,
      );
    }
  }
}
