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

  ItemUpdateRequest: {
    type: 'object',
    properties: {
      content: { type: 'string' },
      is_completed: {
        type: 'boolean',
        description:
          '設置項目的完成狀態。當設置為 true 時，系統會自動記錄完成時間；設置為 false 時，會清除完成時間。',
      },
      todoId: { type: 'number' },
    },
  } as SchemaObject,

  ItemResponse: {
    type: 'object',
    properties: {
      id: { type: 'number' },
      content: { type: 'string' },
      is_completed: { type: 'boolean' },
      completed_at: {
        type: 'string',
        format: 'date-time',
        description:
          '系統自動管理的完成時間戳記。請勿直接修改此欄位，它會根據 is_completed 的值自動更新。',
      },
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
