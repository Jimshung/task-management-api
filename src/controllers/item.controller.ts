import { inject } from '@loopback/core';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  requestBody,
  response,
  Response,
  RestBindings,
} from '@loopback/rest';
import { ApiError, ErrorCodes } from '../errors';
import { Item } from '../models';
import { ItemService } from '../services';

export class ItemController {
  constructor(
    @inject('services.ItemService')
    private itemService: ItemService,
    @inject(RestBindings.Http.RESPONSE)
    private res: Response,
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
  public async findByTodoId(
    @param.path.number('todoId') todoId: number,
    @param.query.boolean('isCompleted') isCompleted?: boolean,
  ): Promise<Item[]> {
    if (!todoId || isNaN(todoId)) {
      throw new ApiError(400, '無效的待辦事項ID', ErrorCodes.VALIDATION_ERROR);
    }
    return this.itemService.findItemsByTodoId(todoId, { isCompleted });
  }

  @get('/items/{id}')
  @response(200, {
    description: 'Item model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Item),
      },
    },
  })
  public async findById(@param.path.number('id') id: number): Promise<Item> {
    return this.itemService.findById(id);
  }

  @post('/todos/{todoId}/items')
  @response(201, {
    description: 'Item model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Item, {
          title: 'NewItem',
          exclude: ['id', 'todoId'],
        }),
      },
    },
  })
  public async create(
    @param.path.number('todoId') todoId: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Item, {
            title: 'NewItem',
            exclude: ['id', 'todoId'],
          }),
        },
      },
    })
    item: Omit<Item, 'id' | 'todoId'>,
  ): Promise<Item> {
    const result = await this.itemService.create({ ...item, todoId });
    this.res.status(201);
    return result;
  }

  @patch('/items/{id}')
  @response(200, {
    description: 'Item model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Item),
      },
    },
  })
  public async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Item, { partial: true }),
        },
      },
    })
    item: Partial<Item>,
  ): Promise<Item> {
    return this.itemService.updateById(id, item);
  }

  @del('/items/{id}')
  @response(204, {
    description: 'Item DELETE success',
  })
  public async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.itemService.deleteById(id);
  }
}
