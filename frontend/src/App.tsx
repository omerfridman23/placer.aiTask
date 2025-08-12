import { useState } from 'react'
import './App.css'

interface User {
  id: string;
  name: string;
  last_name: string | null;
  email: string;
  createdAt: string;
}

function App() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('http://localhost:4000/api/users')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const apiResponse = await response.json()
      setUsers(apiResponse.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users')
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h1 className="mb-4 text-center">PlacerAi Users</h1>
          
          <div className="text-center mb-4">
            <button 
              onClick={fetchUsers}
              disabled={loading}
              className={`btn btn-lg ${loading ? 'btn-secondary' : 'btn-primary'}`}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Loading...
                </>
              ) : (
                'Fetch All Users'
              )}
            </button>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              <strong>Error:</strong> {error}
            </div>
          )}

          {users.length > 0 && (
            <div className="mt-4">
              <h2 className="mb-3">Users ({users.length}):</h2>
              <div className="row g-3">
                {users.map((user) => (
                  <div key={user.id} className="col-md-6 col-lg-4">
                    <div className="card h-100">
                      <div className="card-body">
                        <h5 className="card-title">
                          {user.name} {user.last_name || ''}
                        </h5>
                        <p className="card-text text-muted">{user.email}</p>
                        <small className="text-muted">
                          Created: {new Date(user.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && users.length === 0 && !error && (
            <div className="text-center mt-4">
              <p className="text-muted">
                Click the button to fetch users from the backend
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
