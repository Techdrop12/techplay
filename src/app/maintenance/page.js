// ✅ src/app/maintenance/page.js

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-4">Site en maintenance</h1>
      <p>
        Nous procédons à des améliorations techniques.<br />
        Revenez dans quelques minutes ! 🚧
      </p>
    </div>
  );
}
