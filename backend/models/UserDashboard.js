let _dashboards = [];

const UserDashboard = {
  create: async (data) => {
    const id = String(_dashboards.length + 1);
    const item = { id, ...data };
    _dashboards.push(item);
    return item;
  },
  find: async () => {
    return _dashboards;
  }
};

export default UserDashboard;
