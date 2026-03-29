import { useEffect, useState, type ChangeEvent } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { useSeo } from "../lib/useSeo";
import "./Profile.css";
import Footer from "../Components/Footer";

export default function Profile() {
  useSeo({
    title: "My Profile | ASIKA",
    description: "Manage your ASIKA profile details.",
    path: "/profile",
    robots: "noindex, nofollow",
  });

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    username: "",
    first_name: "",
    last_name: "",
  });

  useEffect(() => {
    const getProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setUser(user);

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setForm({
          username: data.username || "",
          first_name: data.first_name || "",
          last_name: data.last_name || "",
        });
      }

      setLoading(false);
    };

    getProfile();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update(form)
      .eq("id", user.id);

    if (!error) {
      setEditing(false);
      toast.success("Profile updated successfully.");
    } else {
      toast.error(error.message);
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="profile-spinner" />
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <p className="profile-loading">Please log in to view your profile.</p>;
  }

  return (
    <>
      <div className="profile-page">
        <p className="back-link" onClick={() => window.history.back()}>
          {"<-"} Back to store
        </p>

        <div className="profile-header">
          <div className="avatar">{form.first_name?.charAt(0) || "U"}</div>

          <div>
            <h1>My Profile</h1>
            <p className="sub">Manage your account details</p>
          </div>
        </div>

        <div className="profile-card">
          <div className="profile-section">
            <div className="field">
              <label>USERNAME</label>
              {editing ? (
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                />
              ) : (
                <p>@{form.username}</p>
              )}
            </div>

            <div className="row">
              <div className="field">
                <label>FIRST NAME</label>
                {editing ? (
                  <input
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{form.first_name}</p>
                )}
              </div>

              <div className="field">
                <label>LAST NAME</label>
                {editing ? (
                  <input
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{form.last_name}</p>
                )}
              </div>
            </div>

            <div className="field email">
              <label>EMAIL</label>
              <div className="email-row">
                <p>{user.email}</p>
                <span className="badge">READ ONLY</span>
              </div>
            </div>
          </div>

          {!editing ? (
            <button className="edit-btn" onClick={() => setEditing(true)}>
              Edit Profile
            </button>
          ) : (
            <button className="save-btn" onClick={handleSave}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
