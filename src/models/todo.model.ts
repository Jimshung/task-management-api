import { Entity, model, property, hasMany } from '@loopback/repository';
import { Item } from './item.model';

@model({
  settings: {
    indexes: {
      idx_status: {
        keys: { status: 1 },
      },
      idx_deleted_at: {
        keys: { deleted_at: 1 },
      },
    },
  },
})
export class Todo extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  title: string;

  @property({
    type: 'string',
  })
  subtitle?: string;

  @property({
    type: 'string',
    required: true,
    default: 'ACTIVE',
  })
  status: 'ACTIVE' | 'INACTIVE';

  @property({
    type: 'date',
  })
  deleted_at?: string;

  @hasMany(() => Item)
  items: Item[];

  constructor(data?: Partial<Todo>) {
    super(data);
  }
}
