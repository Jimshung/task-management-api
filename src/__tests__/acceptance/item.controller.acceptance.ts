import { Client, expect } from '@loopback/testlab';
import { TodoAppApplication } from '../..';
import { setupApplication } from './test-helper';

describe('ItemController', () => {
  let app: TodoAppApplication;
  let client: Client;
  let todoId: number;
  let itemId: number;

  before('setupApplication', async () => {
    ({ app, client } = await setupApplication());
  });

  after(async () => {
    await app.stop();
  });

  beforeEach(async () => {
    // 創建測試用的 Todo 和 Item
    const todoResponse = await client.post('/todos').send({
      todo: {
        title: '測試待辦事項',
        status: 'ACTIVE',
      },
      items: [
        {
          content: '測試項目1',
          is_completed: false,
        },
      ],
    });

    todoId = todoResponse.body.id;
    itemId = todoResponse.body.items[0].id;
  });

  it('查詢特定 Todo 的所有項目 - 成功', async () => {
    const res = await client.get(`/todos/${todoId}/items`);
    expect(res.status).to.equal(200);
    expect(res.body).to.be.Array();
    expect(res.body[0]).to.have.property('content', '測試項目1');
  });

  it('查詢特定 Todo 的已完成項目 - 成功', async () => {
    const res = await client
      .get(`/todos/${todoId}/items`)
      .query({ isCompleted: true });
    expect(res.status).to.equal(200);
    expect(res.body).to.be.Array();
  });

  it('更新項目完成狀態 - 成功', async () => {
    const res = await client.patch(`/items/${itemId}/completion`).send({
      isCompleted: true,
    });
    expect(res.status).to.equal(204);
  });

  it('批量更新項目狀態 - 成功', async () => {
    const res = await client.patch('/items/bulk-completion').send({
      ids: [itemId],
      isCompleted: true,
    });
    expect(res.status).to.equal(204);
  });
});
