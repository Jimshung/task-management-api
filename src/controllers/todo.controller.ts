import { inject } from '@loopback/core';
import { model } from '@loopback/repository';
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
import { ApiError, ErrorCodes } from '../errors/api-error';
import { Item, Todo } from '../models';
import { TodoSchemas } from '../schemas/todo.schema';
import { TodoService } from '../services';

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
      },
    },
  })
  @response(422, {
    description: 'Validation Error',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'number' },
            name: { type: 'string' },
            message: { type: 'string' },
            code: { type: 'string' },
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
  ): Promise<{ todo: Todo; items: Item[] }> {
    try {
      if (!data.todo.title) {
        throw new ApiError(422, '標題為必填欄位', ErrorCodes.VALIDATION_ERROR, {
          field: 'title',
        });
      }

      if (
        data.todo.status &&
        !['ACTIVE', 'INACTIVE'].includes(data.todo.status)
      ) {
        throw new ApiError(422, '無效的狀態值', ErrorCodes.VALIDATION_ERROR, {
          field: 'status',
          value: data.todo.status,
        });
      }

      console.log('接收到的請求數據:', data);
      const result = await this.todoService.createTodoWithItems(data);
      console.log('創建成功，返回結果:', result);
      return result;
    } catch (error) {
      console.error('創建 Todo 失敗:', error);

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

  @patch('/todos/{id}')
  @response(200, {
    description: 'Todo PATCH success',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Todo),
      },
    },
  })
  public async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Todo, { partial: true }),
        },
      },
    })
    todo: Partial<Todo>,
  ): Promise<Todo> {
    try {
      const existingTodo = await this.todoService.findTodoById(id);
      if (!existingTodo) {
        throw new ApiError(404, '找不到該待辦事項', ErrorCodes.NOT_FOUND);
      }

      if (todo.status && !['ACTIVE', 'INACTIVE'].includes(todo.status)) {
        throw new ApiError(422, '無效的狀態值', ErrorCodes.VALIDATION_ERROR, {
          field: 'status',
          value: todo.status,
        });
      }

      await this.todoService.updateTodo(id, todo);
      const updatedTodo = await this.todoService.findTodoById(id);
      if (!updatedTodo) {
        throw new ApiError(404, '找不到該待辦事項', ErrorCodes.NOT_FOUND);
      }
      return updatedTodo;
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

  @del('/todos/{id}')
  @response(204, {
    description: 'Todo DELETE success (No Content)',
  })
  public async delete(@param.path.number('id') id: number): Promise<void> {
    await this.todoService.deleteTodo(id);
  }

  @get('/todos/{id}')
  @response(200, {
    description: 'Todo model instance with items',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Todo, {
          includeRelations: true,
        }),
      },
    },
  })
  @response(404, {
    description: 'Todo not found',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                statusCode: { type: 'number' },
                name: { type: 'string' },
                message: { type: 'string' },
                code: { type: 'string' },
                details: {
                  type: 'object',
                  additionalProperties: true,
                },
              },
            },
          },
        },
      },
    },
  })
  public async findById(
    @param.path.number('id', { required: true }) id: number,
  ): Promise<Todo> {
    try {
      const todo = await this.todoService.findTodoById(id);

      if (!todo) {
        throw new ApiError(404, '找不到該待辦事項', ErrorCodes.NOT_FOUND, {
          id,
        });
      }

      return todo;
    } catch (error) {
      if (error.code === 'INVALID_PARAMETER_VALUE') {
        throw error;
      }

      if (error instanceof ApiError) {
        throw error;
      }

      console.error('獲取待辦事項時發生錯誤:', error);
      throw new ApiError(
        500,
        '獲取待辦事項失敗',
        ErrorCodes.DATABASE_ERROR,
        error,
      );
    }
  }
}
