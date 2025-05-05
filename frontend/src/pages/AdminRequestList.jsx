import { useEffect, useState } from "react";
import { Loader2, CheckCircle, Mail, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

const AdminRequestList = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [accepting, setAccepting] = useState(null); // email of user being accepted


  const accessGranted = requests.filter((req) => req.access === true);
  const accessPending = requests.filter((req) => req.access === false);

  const { fetchRequests, adminLogout, authAdmin, acceptRequest } = useAuthStore();
  const navigate = useNavigate();

  console.log('authAdmin:- ' + authAdmin)
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchRequests();
        console.log("Fetched data:", data);
        setRequests(Array.isArray(data) ? data : data.users || []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load requests");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [fetchRequests]);

  const handleAccept = async (email) => {
    if (!email) return;

    setAccepting(email);
    try {
      await acceptRequest(email)
      toast.success(`Accepted ${email}`);
      setRequests((prev) => prev.filter((req) => req.email !== email));
    } catch (error) {
      console.error(error);
      toast.error("Failed to accept request");
    } finally {
      setAccepting(null);
    }
  };

  const handleLogout = async () => {
    await adminLogout();
    navigate("/admin-login");
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ marginTop: '60px' }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Requested Users</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        >
          <LogOut className="size-4" />
          Logout
        </button>
      </div>

      {/* 🔶 Pending Requests */}
      {/* <h2 className="text-xl font-semibold mb-3 ">Pending Requests</h2> */}
      {accessPending.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-gray-500 border border-dashed rounded-md  mb-3">
          <Mail className="size-8 mb-2" />
          <p className="text-center text-sm">No pending user requests at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-4 mb-8">
          {accessPending.map((user) => ( 
            <div
              key={user._id}
              className="flex justify-between items-center p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Mail className="size-5 text-primary" />
                <span className="font-medium">{user.email}</span>
              </div>
              <button
                onClick={() => handleAccept(user.email)}
                className="btn btn-success btn-sm flex items-center gap-1"
                disabled={accepting === user.email}
              >
                {accepting === user.email ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="size-4" />
                    Accept
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

     {/* <h2 className="text-xl font-semibold mb-3 ">Accessed Users</h2> */}
      {accessGranted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-gray-500 border border-dashed rounded-md mb-3">
          <CheckCircle className="size-8 mb-2" />
          <p className="text-center text-sm">No users have been granted access yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {accessGranted.map((user) => (
            <div
              key={user._id}
              className="flex justify-between items-center p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Mail className="size-5 text-green-600" />
                <span className="font-medium text-green-700">{user.email}</span>
              </div>
              <span className="text-green-500 font-medium">Access Granted</span>
            </div>
          ))}
        </div>
      )}

    </div>
  );

};

export default AdminRequestList;
