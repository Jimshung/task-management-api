import { inject } from '@loopback/core';
import { juggler, repository } from '@loopback/repository';
import { Item, Todo } from '../models';
import { ItemRepository } from '../repositories/item.repository';
import { TodoRepository } from '../repositories/todo.repository';

export class DatabaseChecker {
  constructor(
    @inject('datasources.mysql')
    private dataSource: juggler.DataSource,
    @repository(TodoRepository)
    private todoRepository: TodoRepository,
    @repository(ItemRepository)
    private itemRepository: ItemRepository,
  ) {}

  async checkConnection(): Promise<void> {
    try {
      await this.dataSource.ping();
      console.log('數據庫連接狀態: 成功');

      await this.checkModels();

      await this.checkRelations();
    } catch (error) {
      throw new Error(`數據庫檢查失敗: ${error.message}`);
    }
  }

  private async checkModels(): Promise<void> {
    const todoCount = await this.todoRepository.count();
    console.log('Todo 表狀態:', {
      存在: true,
      記錄數: todoCount.count,
    });

    const itemCount = await this.itemRepository.count();
    console.log('Item 表狀態:', {
      存在: true,
      記錄數: itemCount.count,
    });
  }

  private async checkRelations(): Promise<void> {
    const todo = await this.todoRepository.findOne({
      include: ['items'],
    });

    if (todo) {
      console.log('關聯檢查結果:', {
        'Todo-Item 關聯': '正常',
        示例數據: {
          todoId: todo.id,
          itemCount: todo.items?.length ?? 0,
        },
      });
    }
  }

  async validateSchema(): Promise<void> {
    const models = [Todo, Item];
    const validationResults = [];

    for (const model of models) {
      const modelName = model.name;
      try {
        const metadata = this.dataSource.getModel(modelName);
        if (!metadata) {
          throw new Error(`無法找到模型 ${modelName} 的元數據`);
        }
        validationResults.push({
          model: modelName,
          status: '有效',
          properties: Object.keys(metadata.definition.properties),
          relations: Object.keys(metadata.definition.relations || {}),
        });
      } catch (error) {
        validationResults.push({
          model: modelName,
          status: '無效',
          error: error.message,
        });
      }
    }

    console.log('模型架構驗證結果:', validationResults);
  }

  async checkIndexes(): Promise<void> {
    const todoMetadata = this.dataSource.getModel('Todo');
    const itemMetadata = this.dataSource.getModel('Item');

    if (!todoMetadata || !itemMetadata) {
      throw new Error('無法獲取模型元數據');
    }

    console.log('索引信息:', {
      Todo: todoMetadata || {},
      Item: itemMetadata || {},
    });
  }
}
