import { useState } from "react";
import { Mail, MessageSquare, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

import AuthImagePattern from "../components/AuthImagePattern";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";

const RequestPage = () => {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);

  const { request, isRequested } = useAuthStore();

  const validateEmail = (email) => {
    if (!email.trim()) {
      toast.error("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Invalid email format");
      return false;
    }
    return true;
  };

  const handleRequest = async (e) => {
    e.preventDefault();
  
    const success = validateEmail(email);
  
    if (!success) return;
  
    setIsSending(true);
    try {
      await request({ email });
      setEmail(""); 
    } catch (error) {
      console.log(error);
    } finally {
      setIsSending(false);
    }
  };
  
  

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Request Access</h1>
              <p className="text-base-content/60">Enter your email to request access</p>
            </div>
          </div>

          <form onSubmit={handleRequest} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Work Email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="size-5 text-base-content/40" />
                </div>
                <input
                  type="email"
                  className="input input-bordered w-full pl-10"
                  placeholder="employee@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={isSending}>
              {isSending ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Request"
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-base-content/60">
              Already have access?{" "}
              <Link to="/login" className="link link-primary">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side */}
      <AuthImagePattern
        title="Join the team"
        subtitle="Request access to stay updated with the latest from your workplace."
      />
    </div>
  );
};

export default RequestPage;
