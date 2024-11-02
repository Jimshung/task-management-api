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
import { Item, Todo } from '../models';
import { TodoExamples, TodoSchemas } from '../schemas/todo.schema';
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
            code: { type: 'string' },
            message: { type: 'string' },
          },
        },
        examples: {
          'missing-title': {
            summary: '缺少標題',
            value: {
              code: 'VALIDATION_FAILED',
              message: 'Todo title is required',
            },
          },
        },
      },
    },
  })
  async create(
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
      todo: Omit<Todo, 'id'>;
      items?: Omit<Item, 'id' | 'todo_id'>[];
    },
  ): Promise<Todo> {
    return this.todoService.createTodoWithItems(data.todo, data.items || []);
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
  async find(
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
  async updateStatus(
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
  async delete(@param.path.number('id') id: number): Promise<void> {
    await this.todoService.deleteTodo(id);
  }
}
