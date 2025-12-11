import { useSelector } from 'react-redux';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div style={{ padding: '40px' }}>
      <h1>Dashboard</h1>
      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
        <h3>User Information</h3>
        <p><strong>Username:</strong> {user?.username}</p>
      </div>
    </div>
  );
};

export default Dashboard;
