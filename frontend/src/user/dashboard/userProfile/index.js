const Profile = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow border">
      <h2 className="text-xl font-semibold mb-2">My Profile</h2>

      <p>Name: Student Name</p>
      <p>Email: student@email.com</p>
      <p>PG Location: Vadodara</p>

      <button className="mt-4 px-4 py-2 bg-primary text-white rounded-xl">
        Edit Profile
      </button>
    </div>
  );
};

export default Profile;
