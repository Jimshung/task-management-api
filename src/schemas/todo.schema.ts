import { SchemaObject } from '@loopback/rest';

export const TodoSchemas = {
  TodoCreateRequest: {
    type: 'object',
    properties: {
      todo: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string' },
          subtitle: { type: 'string' },
          status: {
            type: 'string',
            enum: ['ACTIVE', 'INACTIVE'],
            default: 'ACTIVE',
          },
        },
      },
      items: {
        type: 'array',
        items: {
          type: 'object',
          required: ['content'],
          properties: {
            content: { type: 'string' },
            is_completed: { type: 'boolean', default: false },
          },
        },
      },
    },
  } as SchemaObject,

  TodoCreateResponse: {
    type: 'object',
    properties: {
      id: { type: 'number' },
      title: { type: 'string' },
      subtitle: { type: 'string' },
      status: {
        type: 'string',
        enum: ['ACTIVE', 'INACTIVE'],
      },
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            content: { type: 'string' },
            is_completed: { type: 'boolean' },
            completed_at: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  } as SchemaObject,
};

export const TodoExamples = {
  TodoCreateRequest: {
    todo: {
      title: '週末計劃',
      subtitle: '要做的事',
      status: 'ACTIVE',
    },
    items: [
      {
        content: '買菜',
        is_completed: false,
      },
    ],
  },
};
