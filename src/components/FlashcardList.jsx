function FlashcardList({ flashcards }) {
  return (
    <div>
      <h3>Liste des flashcards</h3>
      <ul>
        {flashcards.map((fc) => (
          <li key={fc.id}><strong>Q:</strong> {fc.question} <strong>R:</strong> {fc.answer}</li>
        ))}
      </ul>
    </div>
  );
}

export default FlashcardList;
