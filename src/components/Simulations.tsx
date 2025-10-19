import React, { useState, useMemo } from 'react';
import simulationResults from '../data/simulation_results.json';

interface SimulationData {
  impactData: Record<string, Record<string, number>>;
  statusData: Record<string, Record<string, string>>;
}

const Simulations: React.FC = () => {
  const [selectedYears, setSelectedYears] = useState<string>('10');

  // Generate year options from 5 to 100 in increments of 5
  const yearOptions = useMemo(() => {
    const options = [];
    for (let i = 5; i <= 100; i += 5) {
      options.push(i.toString());
    }
    return options;
  }, []);

  // Get current simulation data based on selected years
  const currentData = useMemo((): SimulationData => {
    const data = simulationResults[selectedYears as keyof typeof simulationResults];
    return data || { impactData: {}, statusData: {} };
  }, [selectedYears]);

  // Transform impact data for heatmap
  const heatmapData = useMemo(() => {
    const { impactData } = currentData;
    const allYears = new Set<string>();

    // Collect all years from all technologies
    Object.values(impactData).forEach((techData) => {
      Object.keys(techData).forEach((year) => allYears.add(year));
    });

    const sortedYears = Array.from(allYears).sort(
      (a, b) => parseInt(a) - parseInt(b),
    );
    const technologies = Object.keys(impactData);

    return {
      years: sortedYears,
      technologies,
      data: technologies.map((tech) => ({
        technology: tech,
        yearlyData: sortedYears.map((year) => ({
          year,
          impact: impactData[tech][year] || 0,
        })),
      })),
    };
  }, [currentData]);

  // Transform status data for timeline
  const timelineData = useMemo(() => {
    const { statusData } = currentData;
    const allYears = new Set<string>();

    // Collect all years from all technologies
    Object.values(statusData).forEach((techData) => {
      Object.keys(techData).forEach((year) => allYears.add(year));
    });

    const sortedYears = Array.from(allYears).sort(
      (a, b) => parseInt(a) - parseInt(b),
    );
    const technologies = Object.keys(statusData);

    return {
      years: sortedYears,
      technologies,
      data: technologies.map((tech) => ({
        technology: tech,
        yearlyData: sortedYears.map((year) => ({
          year,
          status: statusData[tech][year] || 'Pending',
        })),
      })),
    };
  }, [currentData]);

  // Get color for impact value
  const getImpactColor = (impact: number) => {
    if (impact === 0) return '#f3f4f6'; // gray-100
    const maxImpact = Math.max(
      ...Object.values(currentData.impactData).flatMap((tech) => Object.values(tech)),
    );
    const intensity = Math.min(impact / maxImpact, 1);

    // Blue color scale
    const alpha = 0.1 + intensity * 0.9;
    return `rgba(59, 130, 246, ${alpha})`;
  };

  // Get color for status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return '#3b82f6'; // blue-500
      case 'Pending':
        return '#f59e0b'; // amber-500
      case 'Completed':
        return '#10b981'; // emerald-500
      default:
        return '#6b7280'; // gray-500
    }
  };

  // Status colors for legend consistency
  const statusColors = {
    Active: '#3b82f6',    // blue-500
    Pending: '#f59e0b',   // amber-500
    Completed: '#10b981'  // emerald-500
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalTechs = Object.keys(currentData.impactData).length;
    const maxImpact = Math.max(
      ...Object.values(currentData.impactData).flatMap((tech) => Object.values(tech)),
    );

    // Count current year activities
    const currentYear = new Date().getFullYear().toString();
    const activeNow = Object.values(currentData.statusData).filter(
      (tech) => tech[currentYear] === 'Active',
    ).length;

    return { totalTechs, maxImpact, activeNow };
  }, [currentData]);

  return (
    <div className="p-6 bg-white">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Investment Simulation Results
        </h2>

        <div className="mb-4">
          <label
            htmlFor="years-select"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Simulation Time Horizon (Years):
          </label>
          <select
            id="years-select"
            value={selectedYears}
            onChange={(e) => setSelectedYears(e.target.value)}
            className="block w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year} years
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-8">
        {/* Summary Statistics */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Simulation Summary ({selectedYears} years)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded border">
              <h4 className="font-medium text-gray-600">Total Technologies</h4>
              <p className="text-2xl font-bold text-blue-600">
                {summaryStats.totalTechs}
              </p>
            </div>
            <div className="bg-white p-4 rounded border">
              <h4 className="font-medium text-gray-600">Active Technologies</h4>
              <p className="text-2xl font-bold text-green-600">
                {summaryStats.activeNow}
              </p>
            </div>
            <div className="bg-white p-4 rounded border">
              <h4 className="font-medium text-gray-600">Max Impact (TWh)</h4>
              <p className="text-2xl font-bold text-purple-600">
                {summaryStats.maxImpact.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Impact Heatmap */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Technology Impact Heatmap (TWh)
          </h3>
          <div className="overflow-x-auto">
            <div className="min-w-max">
              {/* Year headers */}
              <div className="flex">
                <div className="w-64 p-2 font-medium text-sm text-gray-700">
                  Technology
                </div>
                {heatmapData.years.map((year) => (
                  <div
                    key={year}
                    className="w-16 p-2 text-center font-medium text-sm text-gray-700"
                  >
                    {year}
                  </div>
                ))}
              </div>

              {/* Technology rows */}
              {heatmapData.data.map((tech) => (
                <div key={tech.technology} className="flex border-t border-gray-200">
                  <div className="w-64 p-2 text-sm text-gray-800 truncate" title={tech.technology}>
                    {tech.technology}
                  </div>
                  {tech.yearlyData.map(({ year, impact }) => (
                    <div
                      key={year}
                      className="w-16 p-2 text-center text-xs border-l border-gray-200"
                      style={{ backgroundColor: getImpactColor(impact) }}
                      title={`${tech.technology} (${year}): ${impact.toFixed(3)} TWh`}
                    >
                      {impact > 0 ? impact.toFixed(2) : ''}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Technology Status Timeline
          </h3>
          <div className="mb-4 flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div 
                className="w-4 h-4 rounded mr-2"
                style={{ backgroundColor: statusColors.Active }}
              ></div>
              <span>Active</span>
            </div>
            <div className="flex items-center">
              <div 
                className="w-4 h-4 rounded mr-2"
                style={{ backgroundColor: statusColors.Pending }}
              ></div>
              <span>Pending</span>
            </div>
            <div className="flex items-center">
              <div 
                className="w-4 h-4 rounded mr-2"
                style={{ backgroundColor: statusColors.Completed }}
              ></div>
              <span>Completed</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-max">
              {/* Year headers */}
              <div className="flex">
                <div className="w-64 p-2 font-medium text-sm text-gray-700">
                  Technology
                </div>
                {timelineData.years.map((year) => (
                  <div
                    key={year}
                    className="w-16 p-2 text-center font-medium text-sm text-gray-700"
                  >
                    {year}
                  </div>
                ))}
              </div>

              {/* Technology rows */}
              {timelineData.data.map((tech) => (
                <div key={tech.technology} className="flex border-t border-gray-200">
                  <div className="w-64 p-2 text-sm text-gray-800 truncate" title={tech.technology}>
                    {tech.technology}
                  </div>
                  {tech.yearlyData.map(({ year, status }) => (
                    <div
                      key={year}
                      className="w-16 p-1 text-center border-l border-gray-200"
                      title={`${tech.technology} (${year}): ${status}`}
                    >
                      <div
                        className="w-full h-6 rounded"
                        style={{ backgroundColor: getStatusColor(status) }}
                      ></div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulations;
