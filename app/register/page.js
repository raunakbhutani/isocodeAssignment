import RegisterForm from "@/components/register-form";

export default function RegisterPage() {
  return (
    <main className="mx-auto max-w-lg px-5 py-20">
      <p className="eyebrow">DriveHub account</p>
      <h1 className="mt-3 text-3xl font-semibold">Create a buyer account</h1>
      <RegisterForm />
    </main>
  );
}
