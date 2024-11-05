import { Client, expect } from '@loopback/testlab';
import { TodoAppApplication } from '../..';
import { initializeTestDatabase } from '../../utils/test-db-init';
import { TodoItem } from '../types';
import { setupApplication } from './test-helper';

describe('ItemController', () => {
  let app: TodoAppApplication;
  let client: Client;
  let todoId: number;
  let itemId: number;

  before('setupApplication', async () => {
    try {
      await initializeTestDatabase();
      ({ app, client } = await setupApplication());
    } catch (error) {
      console.error('測試設置失敗:', error);
      throw error;
    }
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
    console.log('試：開始執行新增 Item 測試');
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

  describe('更新項目狀態', () => {
    it('更新項目為已完成 - 應自動設置完成時間', async () => {
      const res = await client.patch(`/items/${itemId}`).send({
        is_completed: true,
      });

      expect(res.status).to.equal(200);
      expect(res.body.is_completed).to.be.true();
      expect(res.body.completed_at).to.be.String();
      expect(new Date(res.body.completed_at)).to.be.instanceOf(Date);
    });

    it('更新項目為未完成 - 應清除完成時間', async () => {
      // 先將項目設為已完成
      await client.patch(`/items/${itemId}`).send({
        is_completed: true,
      });

      // 再將項目設為未完成
      const res = await client.patch(`/items/${itemId}`).send({
        is_completed: false,
      });

      expect(res.status).to.equal(200);
      expect(res.body.is_completed).to.be.false();
      expect(res.body.completed_at).to.be.null();
    });

    it('更新項目內容 - 不應影響完成狀態', async () => {
      // 先設置初始狀態
      const initialRes = await client.patch(`/items/${itemId}`).send({
        is_completed: true,
      });
      const initialCompletedAt = initialRes.body.completed_at;

      // 更新內容
      const res = await client.patch(`/items/${itemId}`).send({
        content: '更新的內容',
      });

      expect(res.status).to.equal(200);
      expect(res.body.content).to.equal('更新的內容');
      expect(res.body.is_completed).to.be.true();
      expect(res.body.completed_at).to.equal(initialCompletedAt);
    });

    it('更新不存在的項目 - 應返回404', async () => {
      const nonExistentId = 99999;
      const res = await client.patch(`/items/${nonExistentId}`).send({
        content: '測試內容',
      });

      expect(res.status).to.equal(404);
      expect(res.body.error).to.containDeep({
        statusCode: 404,
        name: 'ApiError',
        message: '找不到要更新的項目',
        code: 'NOT_FOUND',
        details: {
          id: nonExistentId,
        },
      });
    });
  });

  describe('刪除項目', () => {
    it('刪除存在的項目 - 成功', async () => {
      const res = await client.del(`/items/${itemId}`);
      expect(res.status).to.equal(204);

      // 確認項目已被刪除
      const getRes = await client.get(`/items/${itemId}`);
      expect(getRes.status).to.equal(404);
    });

    it('刪除不存在的項目 - 應返回404', async () => {
      const nonExistentId = 99999;
      const res = await client.del(`/items/${nonExistentId}`);

      expect(res.status).to.equal(404);
      expect(res.body.error).to.containDeep({
        statusCode: 404,
        name: 'ApiError',
        message: '找不到要刪除的項目',
        code: 'NOT_FOUND',
        details: {
          id: nonExistentId,
        },
      });
    });

    it('刪除項目後，該項目不應出現在待辦事項的項目列表中', async () => {
      // 刪除項目
      await client.del(`/items/${itemId}`);

      // 檢查待辦事項的項目列表
      const res = await client.get(`/todos/${todoId}/items`);
      expect(res.status).to.equal(200);
      expect(res.body).to.be.Array();
      expect(
        res.body.find((item: TodoItem) => item.id === itemId),
      ).to.be.undefined();
    });
  });
});
