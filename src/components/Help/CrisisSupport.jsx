import React from 'react';
import { Phone, MessageCircle, Heart, ArrowLeft, ExternalLink, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CrisisSupport = () => {
  const navigate = useNavigate();

  const crisisResources = [
    {
      name: 'National Suicide Prevention Lifeline',
      number: '988',
      description: '24/7 free and confidential support for people in distress',
      type: 'phone',
      available: '24/7'
    },
    {
      name: 'Crisis Text Line',
      number: 'Text HOME to 741741',
      description: 'Free, 24/7 support via text message',
      type: 'text',
      available: '24/7'
    },
    {
      name: 'National Sexual Assault Hotline',
      number: '1-800-656-4673',
      description: 'Confidential support for survivors of sexual assault',
      type: 'phone',
      available: '24/7'
    },
    {
      name: 'National Domestic Violence Hotline',
      number: '1-800-799-7233',
      description: 'Support for domestic violence survivors',
      type: 'phone',
      available: '24/7'
    }
  ];

  const campusResources = [
    {
      name: 'Campus Counseling Center',
      contact: '(555) 123-4567',
      description: 'Professional counseling services for students',
      hours: 'Mon-Fri: 8:00 AM - 6:00 PM',
      location: 'Student Services Building, Room 200'
    },
    {
      name: 'Student Health Services',
      contact: '(555) 123-4568',
      description: 'Medical and mental health services',
      hours: 'Mon-Fri: 8:00 AM - 5:00 PM',
      location: 'Health Center, 1st Floor'
    },
    {
      name: 'Campus Safety',
      contact: '(555) 123-SAFE',
      description: 'Emergency response and safety escort services',
      hours: '24/7',
      location: 'Multiple locations across campus'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
          
          <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-xl p-6 text-white mb-6">
            <div className="flex items-center mb-4">
              <Heart className="h-8 w-8 mr-3" />
              <h1 className="text-2xl font-bold">Crisis Support & Resources</h1>
            </div>
            <p className="text-red-100">
              If you're experiencing a mental health crisis or having thoughts of self-harm, 
              please reach out for help immediately. You are not alone.
            </p>
          </div>
        </div>

        {/* Emergency Alert */}
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <Phone className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Emergency Situations
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  If you are in immediate danger or having thoughts of suicide, please:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Call 911 for immediate emergency assistance</li>
                  <li>Call 988 for the Suicide & Crisis Lifeline</li>
                  <li>Go to your nearest emergency room</li>
                  <li>Contact campus safety: (555) 123-SAFE</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* National Crisis Resources */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Phone className="h-5 w-5 text-red-500 mr-2" />
                National Crisis Resources
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {crisisResources.map((resource, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{resource.name}</h3>
                      <div className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        <Clock className="h-3 w-3 mr-1" />
                        {resource.available}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-lg font-semibold text-gray-900">
                        {resource.number}
                      </span>
                      <div className="flex items-center space-x-2">
                        {resource.type === 'phone' ? (
                          <Phone className="h-4 w-4 text-gray-400" />
                        ) : (
                          <MessageCircle className="h-4 w-4 text-gray-400" />
                        )}
                        <a
                          href={resource.type === 'phone' ? `tel:${resource.number}` : '#'}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Contact Now
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Campus Resources */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Heart className="h-5 w-5 text-[#a5b4fc] mr-2" />
                Campus Resources
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {campusResources.map((resource, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">{resource.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{resource.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="font-mono">{resource.contact}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-2" />
                        <span>{resource.hours}</span>
                      </div>
                      <div className="flex items-start">
                        <div className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0">
                          <div className="h-2 w-2 bg-gray-400 rounded-full mt-1"></div>
                        </div>
                        <span className="text-gray-600">{resource.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Additional Mental Health Resources</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Online Resources</h3>
                <div className="space-y-2">
                  <a
                    href="https://www.mentalhealth.gov"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                  >
                    MentalHealth.gov
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                  <a
                    href="https://www.nami.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                  >
                    National Alliance on Mental Illness
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                  <a
                    href="https://www.samhsa.gov"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                  >
                    SAMHSA Treatment Locator
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Self-Care Tips</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Practice deep breathing exercises</li>
                  <li>• Stay connected with friends and family</li>
                  <li>• Maintain a regular sleep schedule</li>
                  <li>• Engage in physical activity</li>
                  <li>• Limit alcohol and avoid drugs</li>
                  <li>• Consider mindfulness or meditation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-6 bg-[#a5b4fc]/10 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Remember: Seeking help is a sign of strength
          </h3>
          <p className="text-gray-600 mb-4">
            Mental health is just as important as physical health. Don't hesitate to reach out when you need support.
          </p>
          <button
            onClick={() => navigate('/appointments/new')}
            className="px-6 py-2 bg-[#a5b4fc] text-white rounded-lg hover:bg-[#a5b4fc]/90 transition-colors"
          >
            Schedule a Counseling Appointment
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrisisSupport;