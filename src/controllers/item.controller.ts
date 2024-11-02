import { inject } from '@loopback/core';
import {
  get,
  getModelSchemaRef,
  param,
  patch,
  requestBody,
  response,
} from '@loopback/rest';
import { Item } from '../models';
import { ItemService } from '../services';

export class ItemController {
  constructor(
    @inject('services.ItemService')
    private itemService: ItemService,
  ) {}

  @get('/todos/{todoId}/items')
  @response(200, {
    description: 'Array of Item model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Item),
        },
      },
    },
  })
  async findByTodoId(
    @param.path.number('todoId') todoId: number,
    @param.query.boolean('isCompleted') isCompleted?: boolean,
  ): Promise<Item[]> {
    return this.itemService.findItemsByTodoId(todoId, { isCompleted });
  }

  @patch('/items/{id}/completion')
  @response(204, {
    description: 'Item completion status updated successfully',
  })
  async updateCompletion(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['isCompleted'],
            properties: {
              isCompleted: { type: 'boolean' },
            },
          },
        },
      },
    })
    data: {
      isCompleted: boolean;
    },
  ): Promise<void> {
    await this.itemService.updateItemCompletion(id, data.isCompleted);
  }

  @patch('/items/bulk-completion')
  @response(204, {
    description: 'Items completion status updated successfully',
  })
  async bulkUpdateCompletion(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['ids', 'isCompleted'],
            properties: {
              ids: {
                type: 'array',
                items: { type: 'number' },
              },
              isCompleted: { type: 'boolean' },
            },
          },
        },
      },
    })
    data: {
      ids: number[];
      isCompleted: boolean;
    },
  ): Promise<void> {
    await this.itemService.bulkUpdateCompletion(data.ids, data.isCompleted);
  }
}
