import RegistrationForm from "@/app/registration-form";

export default function HomePage() {
  return (
    <main className="page">
      <section className="hero card">
        <p className="eyebrow">Мероприятие</p>
        <h1>Осень для танцев</h1>
        <p className="subtitle">Дата проведения: 10 сентября</p>
        <p className="description">
          Заполните форму ниже, чтобы зарегистрировать коллектив на участие.
        </p>
      </section>

      <section className="card">
        <h2>Регистрация коллектива</h2>
        <RegistrationForm />
      </section>

      <section className="card contacts">
        <h2>Контакты</h2>
        <p>Телефон организатора: 8 905 376 45 34</p>
      </section>
    </main>
  );
}
