import { Outlet } from 'react-router-dom';
import { QuestionnaireProvider } from '../../contexts/QuestionnaireContext';

function SymptomCheckerPage() {
  return (
    <QuestionnaireProvider>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </div>
    </QuestionnaireProvider>
  );
}

export default SymptomCheckerPage;