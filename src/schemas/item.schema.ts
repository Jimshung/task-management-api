import { SchemaObject } from '@loopback/rest';

export const ItemSchemas = {
  ItemCreateRequest: {
    type: 'object',
    required: ['content'],
    properties: {
      content: { type: 'string' },
      is_completed: { type: 'boolean', default: false },
    },
  } as SchemaObject,

  ItemResponse: {
    type: 'object',
    properties: {
      id: { type: 'number' },
      content: { type: 'string' },
      is_completed: { type: 'boolean' },
      completed_at: { type: 'string', format: 'date-time' },
      todoId: { type: 'number' },
    },
  } as SchemaObject,
};

export const ItemExamples = {
  ItemCreateRequest: {
    content: '買菜',
    is_completed: false,
  },
};
