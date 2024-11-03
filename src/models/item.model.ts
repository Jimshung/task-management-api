import {Entity, model, property} from '@loopback/repository';

export interface ItemRelations {
  // 定義任何需要的關係
}

export type ItemWithRelations = Item & ItemRelations;

@model({
  settings: {
    mysql: {
      schema: 'todo_db',
      table: 'item',
      engine: 'InnoDB',
    },
    foreignKeys: {
      fkItemTodo: {
        name: 'fk_item_todo',
        entity: 'Todo',
        entityKey: 'id',
        foreignKey: 'todoId',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
    },
    indexes: {
      idxTodoId: {
        keys: { todoId: 1 },
      },
    },
  },
})
export class Item extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  public id?: number;

  @property({
    type: 'string',
    required: true,
  })
  public content: string;

  @property({
    type: 'number',
    required: true,
    mysql: {
      columnName: 'todoId',
      dataType: 'int',
      nullable: 'N',
    },
  })
  public todoId: number;

  @property({
    type: 'boolean',
    default: false,
    name: 'is_completed',
  })
  public is_completed: boolean;

  @property({
    type: 'date',
    name: 'completed_at',
  })
  public completed_at?: Date;

  constructor(data?: Partial<Item>) {
    super(data);
  }
}
