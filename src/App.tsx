import React, { useState, useEffect } from 'react';
import { Droplet, User, Activity, Ruler, Weight, Calendar } from 'lucide-react';

interface UserInfo {
  age: number;
  activityLevel: number;
  heightFeet: number;
  heightInches: number;
  weight: number;
}

function calculateWaterIntake(userInfo: UserInfo): number {
  const heightCm = (userInfo.heightFeet * 30.48) + (userInfo.heightInches * 2.54);
  const weightKg = userInfo.weight * 0.453592;

  let baseIntake = weightKg * 0.033;

  if (userInfo.age > 30) {
    baseIntake *= 0.95;
  }

  baseIntake *= (1 + (userInfo.activityLevel * 0.01));

  if (heightCm > 180) {
    baseIntake *= 1.1;
  }

  return Math.round(baseIntake);
}

function generateCalendarEvent(liters: number): string {
  const event = {
    title: `Drink ${liters} liters of water`,
    description: 'Daily water intake reminder',
    recurrence: 'RRULE:FREQ=DAILY',
    start: '09:00',
    duration: 'PT12H',
  };

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${event.title}
DESCRIPTION:${event.description}
RRULE:${event.recurrence}
DTSTART:20230101T${event.start.replace(':', '')}00
DURATION:${event.duration}
END:VEVENT
END:VCALENDAR`;

  return `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;
}

function WaterGlass({ fillPercentage }: { fillPercentage: number }) {
  return (
    <div className="relative w-24 h-32 border-4 border-blue-500 rounded-b-3xl mx-auto mt-4">
      <div 
        className="absolute bottom-0 left-0 right-0 bg-blue-400 transition-all duration-500 ease-in-out rounded-b-3xl"
        style={{ height: `${fillPercentage}%` }}
      />
      <div className="absolute top-0 left-0 right-0 h-4 bg-white border-b-4 border-blue-500 rounded-t-lg" />
    </div>
  );
}

function App() {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    age: 30,
    activityLevel: 50,
    heightFeet: 5,
    heightInches: 7,
    weight: 154,
  });
  const [waterIntake, setWaterIntake] = useState<number>(0);

  useEffect(() => {
    setWaterIntake(calculateWaterIntake(userInfo));
  }, [userInfo]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = Math.max(0, parseInt(value) || 0);
    setUserInfo((prev) => ({ ...prev, [name]: numValue }));
  };

  const getActivityLevelLabel = (level: number): string => {
    if (level < 25) return 'Sedentary';
    if (level < 50) return 'Lightly Active';
    if (level < 75) return 'Moderately Active';
    return 'Very Active';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-center mb-8 text-blue-600">Hydration Helper</h1>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <User className="text-blue-500 flex-shrink-0" size={28} />
            <input
              type="number"
              name="age"
              value={userInfo.age || ''}
              onChange={handleInputChange}
              placeholder="Age"
              className="flex-grow border-b-2 border-blue-300 focus:border-blue-500 outline-none p-2 text-lg"
              required
              min="1"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <Activity className="text-blue-500 flex-shrink-0" size={28} />
              <span className="text-lg font-medium text-gray-700">Activity: {getActivityLevelLabel(userInfo.activityLevel)}</span>
            </div>
            <input
              type="range"
              name="activityLevel"
              value={userInfo.activityLevel}
              onChange={handleInputChange}
              className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
              min="0"
              max="100"
              step="1"
            />
          </div>
          <div className="flex items-center space-x-4">
            <Ruler className="text-blue-500 flex-shrink-0" size={28} />
            <div className="flex-grow flex space-x-2">
              <input
                type="number"
                name="heightFeet"
                value={userInfo.heightFeet || ''}
                onChange={handleInputChange}
                placeholder="Feet"
                className="w-1/2 border-b-2 border-blue-300 focus:border-blue-500 outline-none p-2 text-lg"
                required
                min="1"
              />
              <input
                type="number"
                name="heightInches"
                value={userInfo.heightInches || ''}
                onChange={handleInputChange}
                placeholder="Inches"
                className="w-1/2 border-b-2 border-blue-300 focus:border-blue-500 outline-none p-2 text-lg"
                required
                min="0"
                max="11"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Weight className="text-blue-500 flex-shrink-0" size={28} />
            <input
              type="number"
              name="weight"
              value={userInfo.weight || ''}
              onChange={handleInputChange}
              placeholder="Weight (lbs)"
              className="flex-grow border-b-2 border-blue-300 focus:border-blue-500 outline-none p-2 text-lg"
              required
              min="1"
            />
          </div>
        </div>
        <div className="mt-8 text-center">
          <h2 className="text-2xl font-semibold text-blue-700">Daily Water Intake</h2>
          <div className="flex items-center justify-center space-x-4 mt-4">
            <Droplet className="text-blue-500" size={32} />
            <p className="text-4xl font-bold text-blue-600">{waterIntake} Liters</p>
          </div>
          <WaterGlass fillPercentage={Math.min(100, (waterIntake / 4) * 100)} />
          <p className="mt-4 text-gray-600">Spread your intake throughout the day!</p>
          <a
            href={generateCalendarEvent(waterIntake)}
            download="water_intake_reminder.ics"
            className="inline-flex items-center mt-6 bg-green-500 text-white rounded-full px-6 py-3 hover:bg-green-600 transition-colors text-lg font-semibold"
          >
            <Calendar className="mr-2" size={24} />
            Add to Calendar
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;