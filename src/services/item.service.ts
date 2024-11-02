import { injectable } from '@loopback/core';
import { repository } from '@loopback/repository';
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
    const updateData: Partial<Item> = {
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : undefined,
    };

    await this.itemRepository.updateById(id, updateData);
  }

  // 批量更新項目狀態
  async bulkUpdateCompletion(
    ids: number[],
    isCompleted: boolean,
  ): Promise<void> {
    const updateData: Partial<Item> = {
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : undefined,
    };

    await Promise.all(
      ids.map(id => this.itemRepository.updateById(id, updateData)),
    );
  }

  // 取得特定 Todo 的所有項目
  async findItemsByTodoId(
    todoId: number,
    filter?: {
      isCompleted?: boolean;
    },
  ): Promise<Item[]> {
    const whereClause = {
      todo_id: todoId,
      ...(filter?.isCompleted !== undefined && {
        is_completed: filter.isCompleted,
      }),
    };

    return this.itemRepository.find({
      where: whereClause,
    });
  }
}
