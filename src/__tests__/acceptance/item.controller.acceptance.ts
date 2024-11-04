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

    todoId = todoResponse.body.todo.id;
    itemId = todoResponse.body.items[0].id;
  });

  // 測試取得某 Todo 下的所有 Items（支援篩選）
  it('取得某 Todo 下的所有 Items - 成功', async () => {
    console.log('測試使用的 todoId:', todoId);
    const res = await client.get(`/todos/${todoId}/items`);
    console.log('API 響應:', res.status, res.body);
    expect(res.status).to.equal(200);
    expect(res.body).to.be.Array();
    expect(res.body[0]).to.have.properties(['content', 'is_completed']);
  });

  // 測試取得某 Todo 下的所有 Items（篩選功能）
  it('取得某 Todo 下的所有 Items - 篩選已完成項目', async () => {
    // 先更新一個項目為已完成
    await client.patch(`/items/${itemId}`).send({
      is_completed: true,
    });

    const res = await client
      .get(`/todos/${todoId}/items`)
      .query({ isCompleted: true });

    expect(res.status).to.equal(200);
    expect(res.body).to.be.Array();
    expect(res.body.length).to.equal(1);
    expect(res.body[0].is_completed).to.be.true();
  });

  // 測試根據 ID 取得單一 Item
  it('根據 ID 取得單一 Item - 成功', async () => {
    const res = await client.get(`/items/${itemId}`);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.properties(['id', 'content', 'is_completed']);
  });

  // 測試新增 Item
  it('新增 Item - 成功', async () => {
    console.log('測試：開始執行新增 Item 測試');
    console.log('測試：使用的 todoId =', todoId);

    const newItem = {
      content: '新測試項目',
      is_completed: false,
    };
    console.log('測試：準備發送的數據 =', newItem);

    const res = await client.post(`/todos/${todoId}/items`).send(newItem);

    console.log('測試：收到的完整響應:', {
      status: res.status,
      statusCode: res.statusCode,
      headers: res.headers,
      body: res.body,
    });

    expect(res.status).to.equal(201);
    expect(res.body).to.have.properties(['id', 'content', 'is_completed']);

    console.log('測試：測試完成');
  });

  // 測試更新 Item
  it('更新 Item - 成功', async () => {
    const res = await client.patch(`/items/${itemId}`).send({
      content: '已更新的內容',
      is_completed: true,
    });
    expect(res.status).to.equal(200);
    expect(res.body.content).to.equal('已更新的內容');
  });

  // 測試刪除 Item
  it('刪除 Item - 成功', async () => {
    const res = await client.del(`/items/${itemId}`);
    expect(res.status).to.equal(204);
  });
});
