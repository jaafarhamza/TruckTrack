import { useSelector } from 'react-redux';

const AdminPanel = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div style={{ padding: '40px' }}>
      <h1>Admin Panel</h1>
      <p style={{ color: '#666' }}>Welcome, {user?.username}!</p>
    </div>
  );
};

export default AdminPanel;
