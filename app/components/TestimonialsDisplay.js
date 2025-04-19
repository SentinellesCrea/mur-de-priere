const TestimonialsDisplay = ({ testimonials }) => {
  return (
    <div className="space-y-4 bg-gray-200 p-4 rounded-md">
      {testimonials.length === 0 ? (
        <p>Aucun témoignage disponible.</p>
      ) : (
        testimonials.map((testimonial, index) => (
          <div key={testimonial._id || index} className="border border-gray-300 p-4 rounded shadow-md">
            <p><strong>{testimonial.name} :</strong> {testimonial.testimony}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default TestimonialsDisplay;
