import React from 'react';

interface SocialProofItem {
  id: string;
  name: string;
  specialty?: string;
  image?: string;
  location?: string;
  rating?: number;
  sizeClass?: string;
  positionClass?: string;
}

const SocialProofCloud: React.FC = () => {
  // Mock data for social proof
  const socialProofItems: SocialProofItem[] = [
    {
      id: '1',
      name: 'Dr. González',
      specialty: 'Cardiología',
      image: '/images/doctors/doctor-1.jpg',
      location: 'CDMX',
      rating: 4.9,
      sizeClass: 'w-24 h-24',
      positionClass: 'top-1/4 left-1/4',
    },
    {
      id: '2',
      name: 'Dra. Martínez',
      specialty: 'Pediatría',
      image: '/images/doctors/doctor-2.jpg',
      location: 'Guadalajara',
      rating: 4.8,
      sizeClass: 'w-20 h-20',
      positionClass: 'top-1/3 right-1/4',
    },
    {
      id: '3',
      name: 'Dr. Rodríguez',
      specialty: 'Neurología',
      image: '/images/doctors/doctor-3.jpg',
      location: 'Monterrey',
      rating: 4.7,
      sizeClass: 'w-16 h-16',
      positionClass: 'bottom-1/4 left-1/3',
    },
    {
      id: '4',
      name: 'Dra. Pérez',
      specialty: 'Dermatología',
      image: '/images/doctors/doctor-4.jpg',
      location: 'Puebla',
      rating: 4.9,
      sizeClass: 'w-20 h-20',
      positionClass: 'bottom-1/3 right-1/3',
    },
    {
      id: '5',
      name: 'Dr. López',
      specialty: 'Oftalmología',
      image: '/images/doctors/doctor-5.jpg',
      location: 'CDMX',
      rating: 4.8,
      sizeClass: 'w-16 h-16',
      positionClass: 'top-1/2 left-1/2',
    },
    {
      id: '6',
      name: 'Dra. Sánchez',
      specialty: 'Ginecología',
      image: '/images/doctors/doctor-6.jpg',
      location: 'Cancún',
      rating: 4.9,
      sizeClass: 'w-24 h-24',
      positionClass: 'bottom-1/2 right-1/5',
    },
    {
      id: '7',
      name: 'Dr. Ramírez',
      specialty: 'Traumatología',
      image: '/images/doctors/doctor-7.jpg',
      location: 'Toluca',
      rating: 4.7,
      sizeClass: 'w-20 h-20',
      positionClass: 'top-2/3 left-1/5',
    },
  ];

  // Random animation classes to create a floating effect
  const animationClasses = [
    'animate-float-slow',
    'animate-float-medium',
    'animate-float-fast',
    'animate-float-reverse-slow',
    'animate-float-reverse-medium',
    'animate-float-reverse-fast',
  ];

  // Get a random animation class
  const getRandomAnimation = () => {
    return animationClasses[Math.floor(Math.random() * animationClasses.length)];
  };

  return (
    <section className="py-16 overflow-hidden bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
            Los mejores especialistas te esperan
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Contamos con más de 5,000 médicos en nuestra red, todos verificados y con reseñas de pacientes reales.
          </p>
        </div>

        {/* Fixed size container to control the cloud placement */}
        <div className="relative h-[400px] md:h-[500px] mx-auto max-w-4xl">
          {/* Circles with doctor info */}
          {socialProofItems.map((item) => (
            <div
              key={item.id}
              className={`absolute ${item.positionClass} ${getRandomAnimation()} transform translate-x-1/2 translate-y-1/2`}
            >
              <div className={`${item.sizeClass} rounded-full overflow-hidden shadow-lg bg-white p-1 flex flex-col items-center justify-center text-center transition-transform hover:scale-110`}>
                {item.image ? (
                  <div className="w-1/2 h-1/2 rounded-full overflow-hidden mb-1">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : null}
                <p className="text-xs font-semibold line-clamp-1">{item.name}</p>
                {item.specialty ? (
                  <p className="text-[8px] text-gray-500 line-clamp-1">{item.specialty}</p>
                ) : null}
                {item.rating ? (
                  <div className="flex items-center mt-0.5">
                    <svg
                      className="w-2 h-2 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-[8px] ml-0.5">{item.rating}</span>
                  </div>
                ) : null}
              </div>
            </div>
          ))}

          {/* Center element */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-xl flex items-center justify-center animate-pulse-slow">
              <div className="text-center text-white">
                <p className="text-2xl md:text-3xl font-bold">5,000+</p>
                <p className="text-sm md:text-base">Especialistas</p>
              </div>
            </div>
          </div>

          {/* Background decorative elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-blue-100 rounded-full opacity-50"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-indigo-100 rounded-full opacity-50"></div>
          <div className="absolute bottom-20 left-20 w-16 h-16 bg-green-100 rounded-full opacity-50"></div>
          <div className="absolute top-20 right-20 w-24 h-24 bg-yellow-100 rounded-full opacity-50"></div>
        </div>

        <div className="text-center mt-12">
          <a
            href="/search"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            Ver todos los especialistas
            <svg
              className="ml-2 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default SocialProofCloud;