import {inject} from '@loopback/core';
import {model} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  patch,
  post,
  requestBody,
  response,
} from '@loopback/rest';
import {ApiError, ErrorCodes} from '../errors/api-error';
import {Item, Todo} from '../models';
import {TodoExamples, TodoSchemas} from '../schemas/todo.schema';
import {TodoService} from '../services';

@model({
  description: 'Todo API Controller',
  tags: ['Todo'],
})
export class TodoController {
  constructor(
    @inject('services.TodoService')
    private todoService: TodoService,
  ) {}

  @post('/todos')
  @response(200, {
    description: 'Create a new todo with items',
    content: {
      'application/json': {
        schema: TodoSchemas.TodoCreateResponse,
        examples: {
          success: {
            summary: '成功創建 Todo',
            value: TodoExamples.TodoCreateRequest,
          },
        },
      },
    },
  })
  @response(400, {
    description: 'Invalid input',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'number' },
            code: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  })
  @response(500, {
    description: 'Internal Server Error',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'number' },
            code: { type: 'string' },
            message: { type: 'string' },
            details: { type: 'object' },
          },
        },
      },
    },
  })
  public async create(
    @requestBody({
      description: 'Todo creation request body',
      required: true,
      content: {
        'application/json': {
          schema: TodoSchemas.TodoCreateRequest,
        },
      },
    })
    data: {
      todo: Partial<Todo>;
      items: Partial<Item>[];
    },
  ): Promise<{todo: Todo; items: Item[]}> {
    try {
      console.log('接收到的請求數據:', data);
      const result = await this.todoService.createTodoWithItems(data);
      console.log('創建成功，返回結果:', result);
      return result;
    } catch (error) {
      console.error('創建 Todo 失敗:', error);

      if (error instanceof ApiError) {
        throw error;
      }

      const apiError = new ApiError(
        500,
        '創建待辦事項失敗',
        ErrorCodes.DATABASE_ERROR,
      );
      apiError.details = error;
      throw apiError;
    }
  }

  @get('/todos')
  @response(200, {
    description: 'Array of Todo model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Todo, { includeRelations: true }),
        },
      },
    },
  })
  public async find(
    @param.query.string('status') status?: 'ACTIVE' | 'INACTIVE',
    @param.query.number('page') page?: number,
    @param.query.number('limit') limit?: number,
  ): Promise<Todo[]> {
    return this.todoService.findTodos({ status, page, limit });
  }

  @patch('/todos/{id}/status')
  @response(204, {
    description: 'Todo status updated successfully',
  })
  public async updateStatus(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['status'],
            properties: {
              status: {
                type: 'string',
                enum: ['ACTIVE', 'INACTIVE'],
              },
            },
          },
        },
      },
    })
    data: {
      status: 'ACTIVE' | 'INACTIVE';
    },
  ): Promise<void> {
    await this.todoService.updateTodoStatus(id, data.status);
  }

  @del('/todos/{id}')
  @response(204, {
    description: 'Todo DELETE success',
  })
  public async delete(@param.path.number('id') id: number): Promise<void> {
    await this.todoService.deleteTodo(id);
  }
}
