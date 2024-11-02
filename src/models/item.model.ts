import { Entity, model, property, belongsTo } from '@loopback/repository';
import { Todo } from './todo.model';

@model()
export class Item extends Entity {
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
  content: string;

  @property({
    type: 'boolean',
    required: true,
    default: false,
  })
  is_completed: boolean;

  @property({
    type: 'date',
  })
  completed_at?: string;

  @belongsTo(() => Todo)
  todo_id: number;

  constructor(data?: Partial<Item>) {
    super(data);
  }
}
