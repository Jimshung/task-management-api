import { Entity, hasMany, model, property } from '@loopback/repository';
import { Item } from './item.model';

export interface TodoRelations {
  items?: Item[];
}

export type TodoWithRelations = Todo & TodoRelations;

@model({
  settings: {
    mysql: {
      schema: 'todo_db',
      table: 'todo',
      engine: 'InnoDB',
    },
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
    mysql: {
      columnName: 'id',
      dataType: 'int',
      nullable: 'N',
    },
  })
  public id?: number;

  @property({
    type: 'string',
    required: true,
    mysql: {
      columnName: 'title',
      dataType: 'varchar',
      dataLength: 512,
      nullable: 'N',
    },
  })
  public title: string;

  @property({
    type: 'string',
  })
  public subtitle?: string;

  @property({
    type: 'string',
    required: true,
    default: 'ACTIVE',
  })
  public status: 'ACTIVE' | 'INACTIVE';

  @property({
    type: 'date',
    name: 'deleted_at',
    jsonSchema: {
      nullable: true,
    },
  })
  public deletedAt?: Date;

  @hasMany(() => Item)
  public items: Item[];

  constructor(data?: Partial<Todo>) {
    super(data);
  }
}
