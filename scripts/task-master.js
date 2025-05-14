#!/usr/bin/env node

/**
 * task-master.js
 * 
 * A utility script that analyzes tasks from perfectflow.md or greatchat.md, 
 * generates dependency matrices, and provides coverage analysis
 * against the project requirements.
 */

const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');

// Constants
const PERFECTFLOW_PATH = path.join(__dirname, '..', 'perfectflow.md');
const GREATCHAT_PATH = path.join(__dirname, '..', 'greatchat.md');
const TASKS_JSON_PATH = path.join(__dirname, '..', 'tasks', 'tasks.json');
const OPENAI_API_KEY = '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';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
});

/**
 * Main function to run task-master
 */
async function main() {
  try {
    const command = process.argv[2];
    const options = process.argv.slice(3);
    
    // Default to perfectflow if not specified
    let sourceFile = 'perfectflow';
    let outputDir = 'tasks';
    
    // Check if a specific source file is requested
    if (options.includes('--greatchat')) {
      sourceFile = 'greatchat';
      outputDir = 'tasks/greatchat';
      
      // Create the output directory if it doesn't exist
      if (!fs.existsSync(path.join(__dirname, '..', outputDir))) {
        fs.mkdirSync(path.join(__dirname, '..', outputDir), { recursive: true });
      }
    }

    if (!command) {
      displayHelp();
      return;
    }

    switch (command) {
      case 'analyze':
        await analyzeTaskCoverage(sourceFile, outputDir);
        break;
      case 'dependency':
        await buildDependencyMatrix(sourceFile, outputDir);
        break;
      case 'prioritize':
        await buildPriorityHeatmap(sourceFile, outputDir);
        break;
      case 'missing':
        await identifyMissingFeatures(sourceFile, outputDir);
        break;
      case 'epic':
        await wireEpicBacklog(sourceFile, outputDir);
        break;
      case 'help':
        displayHelp();
        break;
      default:
        console.error(`Unknown command: ${command}`);
        displayHelp();
        break;
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

/**
 * Display help information
 */
function displayHelp() {
  console.log(`
Task Master - Project Management Utility

Usage: task-master [command] [options]

Commands:
  analyze     Analyze task coverage against project requirements
  dependency  Build and display task dependency matrix
  prioritize  Generate priority heat-map for tasks
  missing     Identify missing features in current task set
  epic        Wire up epic backlog from tasks
  help        Display this help information

Options:
  --greatchat        Use greatchat.md instead of perfectflow.md
  --output [format]  Output format (json, csv, md)
  --filter [type]    Filter results by type
`);
}

/**
 * Parse the source markdown file and extract tasks
 * @param {string} sourceFile - Source file name ('perfectflow' or 'greatchat')
 * @returns {Array} Array of parsed tasks
 */
function parseTasksFromMarkdown(sourceFile) {
  try {
    const filePath = sourceFile === 'greatchat' ? GREATCHAT_PATH : PERFECTFLOW_PATH;
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Parse the content into sections and tasks
    const sections = [];
    let currentSection = null;
    const tasks = [];

    fileContent.split('\n').forEach(line => {
      // Check if this is a section header (starts with #)
      if (line.startsWith('# ')) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          title: line.substring(2).trim(),
          tasks: []
        };
      } 
      // Check if this is a task line (starts with a number followed by a period)
      else if (/^\d+\.\s/.test(line)) {
        const taskParts = line.match(/^(\d+)\.\s(.*)/);
        if (taskParts && taskParts.length >= 3) {
          const taskId = parseInt(taskParts[1], 10);
          const taskDescription = taskParts[2].trim();
          
          // Extract action and object from task description
          const actionMatch = taskDescription.match(/^(\w+)\s(.*)$/);
          
          if (actionMatch && actionMatch.length >= 3) {
            const task = {
              id: taskId,
              action: actionMatch[1],
              object: actionMatch[2],
              description: taskDescription,
              section: currentSection ? currentSection.title : 'Unknown'
            };
            
            tasks.push(task);
            
            if (currentSection) {
              currentSection.tasks.push(task);
            }
          }
        }
      }
    });

    // Add the last section if it exists
    if (currentSection) {
      sections.push(currentSection);
    }

    return { tasks, sections };
  } catch (error) {
    console.error(`Error parsing ${sourceFile}.md:`, error.message);
    return { tasks: [], sections: [] };
  }
}

/**
 * Parse tasks from tasks.json
 * @returns {Array} Array of parsed tasks
 */
function parseTasksFromJSON() {
  try {
    const tasksContent = fs.readFileSync(TASKS_JSON_PATH, 'utf8');
    const tasksData = JSON.parse(tasksContent);
    
    return tasksData.tasks || [];
  } catch (error) {
    console.error('Error parsing tasks.json:', error.message);
    return [];
  }
}

/**
 * Analyze task coverage against project requirements
 * @param {string} sourceFile - Source file name ('perfectflow' or 'greatchat')
 * @param {string} outputDir - Directory to write output files
 */
async function analyzeTaskCoverage(sourceFile, outputDir) {
  console.log(`Analyzing task coverage from ${sourceFile}.md...`);
  
  const { tasks, sections } = parseTasksFromMarkdown(sourceFile);
  const jsonTasks = parseTasksFromJSON();
  
  // Group the perfectflow tasks by action type
  const actionGroups = {};
  tasks.forEach(task => {
    if (!actionGroups[task.action]) {
      actionGroups[task.action] = [];
    }
    actionGroups[task.action].push(task);
  });
  
  // Analyze coverage by comparing with defined main tasks in tasks.json
  const coverage = {
    total: tasks.length,
    coveredByMainTasks: 0,
    coveredBySubtasks: 0,
    uncovered: [],
    coverageBySection: {},
    coverageByAction: {}
  };
  
  // Initialize section coverage
  sections.forEach(section => {
    coverage.coverageBySection[section.title] = {
      total: section.tasks.length,
      covered: 0,
      percentage: 0
    };
  });
  
  // Initialize action coverage
  Object.keys(actionGroups).forEach(action => {
    coverage.coverageByAction[action] = {
      total: actionGroups[action].length,
      covered: 0,
      percentage: 0
    };
  });
  
  // Check coverage for each perfectflow task
  tasks.forEach(task => {
    let isCovered = false;
    
    // Check if covered by main tasks or their descriptions
    for (const jsonTask of jsonTasks) {
      if (
        jsonTask.title.toLowerCase().includes(task.object.toLowerCase()) ||
        (jsonTask.description && jsonTask.description.toLowerCase().includes(task.object.toLowerCase())) ||
        (jsonTask.details && jsonTask.details.toLowerCase().includes(task.object.toLowerCase()))
      ) {
        isCovered = true;
        coverage.coveredByMainTasks++;
        break;
      }
      
      // Check if covered by subtasks
      if (jsonTask.subtasks) {
        for (const subtask of jsonTask.subtasks) {
          if (
            subtask.title.toLowerCase().includes(task.object.toLowerCase()) ||
            (subtask.description && subtask.description.toLowerCase().includes(task.object.toLowerCase()))
          ) {
            isCovered = true;
            coverage.coveredBySubtasks++;
            break;
          }
        }
        
        if (isCovered) break;
      }
    }
    
    if (!isCovered) {
      coverage.uncovered.push(task);
    } else {
      // Update section coverage
      if (coverage.coverageBySection[task.section]) {
        coverage.coverageBySection[task.section].covered++;
      }
      
      // Update action coverage
      if (coverage.coverageByAction[task.action]) {
        coverage.coverageByAction[task.action].covered++;
      }
    }
  });
  
  // Calculate coverage percentages
  for (const section in coverage.coverageBySection) {
    const sectionData = coverage.coverageBySection[section];
    sectionData.percentage = Math.round((sectionData.covered / sectionData.total) * 100);
  }
  
  for (const action in coverage.coverageByAction) {
    const actionData = coverage.coverageByAction[action];
    actionData.percentage = Math.round((actionData.covered / actionData.total) * 100);
  }
  
  // Overall coverage
  coverage.totalCoveredPercentage = Math.round(((coverage.coveredByMainTasks + coverage.coveredBySubtasks) / coverage.total) * 100);
  
  // Display coverage results
  console.log('\nTask Coverage Analysis:');
  console.log('=======================');
  console.log(`Total tasks in perfectflow.md: ${coverage.total}`);
  console.log(`Tasks covered by main tasks: ${coverage.coveredByMainTasks}`);
  console.log(`Tasks covered by subtasks: ${coverage.coveredBySubtasks}`);
  console.log(`Uncovered tasks: ${coverage.uncovered.length}`);
  console.log(`Overall coverage: ${coverage.totalCoveredPercentage}%`);
  
  console.log('\nCoverage by Section:');
  for (const section in coverage.coverageBySection) {
    const data = coverage.coverageBySection[section];
    console.log(`${section}: ${data.covered}/${data.total} (${data.percentage}%)`);
  }
  
  console.log('\nCoverage by Action:');
  for (const action in coverage.coverageByAction) {
    const data = coverage.coverageByAction[action];
    console.log(`${action}: ${data.covered}/${data.total} (${data.percentage}%)`);
  }
  
  if (coverage.uncovered.length > 0) {
    console.log('\nUncovered Tasks:');
    coverage.uncovered.forEach(task => {
      console.log(`- #${task.id}: ${task.description} [${task.section}]`);
    });
  }
  
  // Write coverage report to file
  fs.writeFileSync(
    path.join(__dirname, '..', outputDir, 'coverage-report.json'),
    JSON.stringify(coverage, null, 2)
  );
  
  console.log(`\nCoverage report written to ${outputDir}/coverage-report.json`);
}

/**
 * Build dependency matrix between tasks
 * @param {string} sourceFile - Source file name ('perfectflow' or 'greatchat')
 * @param {string} outputDir - Directory to write output files
 */
async function buildDependencyMatrix(sourceFile, outputDir) {
  console.log(`Building dependency matrix from ${sourceFile}.md...`);
  
  const { tasks, sections } = parseTasksFromMarkdown(sourceFile);
  const jsonTasks = parseTasksFromJSON();
  
  // Group tasks by section for analysis
  const taskGroups = {};
  sections.forEach(section => {
    taskGroups[section.title] = section.tasks;
  });
  
  const dependencyMatrix = {};
  
  // Try OpenAI first, fall back to heuristic approach if it fails
  let useHeuristicApproach = false;
  
  // Test OpenAI connection with a simple request
  try {
    console.log('Testing OpenAI connection...');
    await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: 'Test connection' }
      ],
      max_tokens: 5
    });
    console.log('OpenAI connection successful, using AI-powered dependency analysis');
  } catch (error) {
    console.warn('OpenAI API connection failed:', error.message);
    console.log('Falling back to heuristic dependency analysis...');
    useHeuristicApproach = true;
  }
  
  if (useHeuristicApproach) {
    // Fallback: Use heuristic approach to determine dependencies
    console.log('Using heuristic approach to analyze dependencies...');
    
    // Heuristic 1: Tasks with higher numbers generally depend on tasks with lower numbers
    // Heuristic 2: Tasks with actions like "Test", "Validate", "Optimize" depend on "Create", "Implement", "Design" tasks with similar objects
    // Heuristic 3: Task objects containing similar keywords may have dependencies
    
    const actionDependencyOrder = {
      'Test': ['Implement', 'Create', 'Design'],
      'Validate': ['Implement', 'Create', 'Design'],
      'Optimize': ['Implement', 'Create'],
      'Refine': ['Implement', 'Create', 'Design'],
      'Integrate': ['Create', 'Implement'],
      'Document': ['Implement', 'Design', 'Create'],
      'Implement': ['Design'],
      'Create': ['Design', 'Define'],
      'Design': ['Define', 'Establish']
    };
    
    // Process each section
    for (const section in taskGroups) {
      console.log(`Analyzing dependencies in section: ${section}`);
      
      const sectionTasks = taskGroups[section];
      
      // For each task, identify potential dependencies
      sectionTasks.forEach(task => {
        const taskId = task.id.toString();
        const dependencies = [];
        
        // Check if this task's action depends on other action types
        const dependentActions = actionDependencyOrder[task.action] || [];
        
        if (dependentActions.length > 0) {
          // Look for tasks with dependent actions and similar objects
          const potentialDependencies = sectionTasks.filter(t => 
            dependentActions.includes(t.action) && 
            t.id < task.id && // Only consider tasks with lower IDs
            (
              task.object.includes(t.object) || 
              t.object.includes(task.object) ||
              calculateObjectSimilarity(task.object, t.object) > 0.4
            )
          );
          
          potentialDependencies.forEach(depTask => {
            dependencies.push(depTask.id);
          });
        }
        
        // If we found dependencies, add them to the matrix
        if (dependencies.length > 0) {
          dependencyMatrix[taskId] = dependencies;
        }
      });
    }
    
    // Add cross-section dependencies using similar heuristics
    console.log('Analyzing cross-section dependencies...');
    
    // For later tasks in sequence, check if they depend on earlier tasks in other sections
    for (let i = 1; i < sections.length; i++) {
      const currentSection = sections[i].title;
      const currentTasks = taskGroups[currentSection];
      
      // Check for dependencies with previous sections
      for (let j = 0; j < i; j++) {
        const previousSection = sections[j].title;
        const previousTasks = taskGroups[previousSection];
        
        // Sample tasks from current section to analyze
        const sampledCurrentTasks = currentTasks.slice(0, Math.min(20, currentTasks.length));
        
        sampledCurrentTasks.forEach(currentTask => {
          const taskId = currentTask.id.toString();
          const dependencies = dependencyMatrix[taskId] || [];
          
          // Find potential dependencies in previous section
          const potentialDependencies = previousTasks.filter(prevTask => {
            const actionDependsOn = actionDependencyOrder[currentTask.action] && 
                                     actionDependencyOrder[currentTask.action].includes(prevTask.action);
            
            const objectSimilarity = calculateObjectSimilarity(currentTask.object, prevTask.object) > 0.5;
            
            return actionDependsOn || objectSimilarity;
          });
          
          // Add up to 3 most relevant dependencies
          potentialDependencies.slice(0, 3).forEach(depTask => {
            dependencies.push(depTask.id);
          });
          
          // If we found cross-section dependencies, update the matrix
          if (dependencies.length > 0) {
            dependencyMatrix[taskId] = dependencies;
          }
        });
      }
    }
    
    console.log('Heuristic dependency analysis complete!');
  } else {
    // Use OpenAI to analyze potential dependencies between tasks
    // For each section, identify dependencies within the section
    for (const section in taskGroups) {
      console.log(`Analyzing dependencies in section: ${section}`);
      
      const sectionTasks = taskGroups[section];
      
      // For larger sections, we'll batch the analysis
      const batchSize = 25;
      for (let i = 0; i < sectionTasks.length; i += batchSize) {
        const batch = sectionTasks.slice(i, i + batchSize);
        
        // Prepare the prompt for OpenAI
        const prompt = `
I have a set of tasks from the "${section}" section of a project. 
Each task has an ID, an action verb, and an object.

Tasks:
${batch.map(task => `${task.id}. ${task.action} ${task.object}`).join('\n')}

Please analyze which tasks likely depend on other tasks in this set. 
Return your analysis as a JSON object where:
- Keys are task IDs
- Values are arrays of task IDs that the key task depends on
- Only include tasks that have dependencies
- Focus on logical dependencies where one task must be completed before another

Example format:
{
  "42": [10, 15],  // Task 42 depends on tasks 10 and 15
  "50": [42, 30]   // Task 50 depends on tasks 42 and 30
}
`;
        
        try {
          const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo-json-mode',
            messages: [
              { role: 'system', content: 'You are a project management assistant specializing in task dependency analysis. Respond in valid JSON format only.' },
              { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3
          });
          
          const content = response.choices[0]?.message.content;
          if (content) {
            const batchDependencies = JSON.parse(content);
            
            // Merge with main dependency matrix
            for (const taskId in batchDependencies) {
              dependencyMatrix[taskId] = batchDependencies[taskId];
            }
          }
        } catch (error) {
          console.error(`Error analyzing batch ${i}-${i+batchSize}:`, error.message);
          console.log('Switching to heuristic approach for dependency analysis...');
          return await buildDependencyMatrix(sourceFile, outputDir); // Restart with heuristic approach
        }
      }
    }
    
    // Also analyze cross-section dependencies
    console.log('Analyzing cross-section dependencies...');
    
    // Sample tasks from each section
    const sampleTasks = [];
    for (const section in taskGroups) {
      const tasks = taskGroups[section];
      const sampleSize = Math.min(5, tasks.length);
      
      // Sample tasks from beginning, middle, and end
      const sampledIndices = [0, Math.floor(tasks.length / 2), tasks.length - 1];
      for (let i = 1; i < sampleSize - 2; i++) {
        sampledIndices.push(Math.floor(Math.random() * tasks.length));
      }
      
      const uniqueIndices = [...new Set(sampledIndices)];
      uniqueIndices.forEach(index => {
        sampleTasks.push(tasks[index]);
      });
    }
    
    // Analyze cross-section dependencies
    if (sampleTasks.length > 0) {
      const prompt = `
I have a set of tasks from different sections of a project.
Each task has an ID, a section, an action verb, and an object.

Tasks:
${sampleTasks.map(task => `${task.id}. [${task.section}] ${task.action} ${task.object}`).join('\n')}

Please analyze which tasks likely depend on tasks from other sections.
Return your analysis as a JSON object where:
- Keys are task IDs
- Values are arrays of task IDs that the key task depends on
- Only include cross-section dependencies
- Focus on logical dependencies where one task must be completed before another

Example format:
{
  "1042": [210, 315],  // Task 1042 depends on tasks 210 and 315 from other sections
  "1250": [542, 830]   // Task 1250 depends on tasks 542 and 830 from other sections
}
`;
      
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo-json-mode',
          messages: [
            { role: 'system', content: 'You are a project management assistant specializing in task dependency analysis. Respond in valid JSON format only.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3
        });
        
        const content = response.choices[0]?.message.content;
        if (content) {
          const crossSectionDependencies = JSON.parse(content);
          
          // Merge with main dependency matrix
          for (const taskId in crossSectionDependencies) {
            dependencyMatrix[taskId] = dependencyMatrix[taskId] || [];
            dependencyMatrix[taskId].push(...crossSectionDependencies[taskId]);
            
            // Remove duplicates
            dependencyMatrix[taskId] = [...new Set(dependencyMatrix[taskId])];
          }
        }
      } catch (error) {
        console.error('Error analyzing cross-section dependencies:', error.message);
      }
    }
  }
  
  // Write dependency matrix to file
  fs.writeFileSync(
    path.join(__dirname, '..', outputDir, 'dependency-matrix.json'),
    JSON.stringify(dependencyMatrix, null, 2)
  );
  
  // Create visual representation
  const graphData = {
    nodes: [],
    links: []
  };
  
  tasks.forEach(task => {
    graphData.nodes.push({
      id: task.id.toString(),
      name: `${task.id}. ${task.action} ${task.object}`,
      section: task.section
    });
  });
  
  for (const taskId in dependencyMatrix) {
    const dependencies = dependencyMatrix[taskId];
    dependencies.forEach(depId => {
      graphData.links.push({
        source: taskId.toString(),
        target: depId.toString(),
        value: 1
      });
    });
  }
  
  fs.writeFileSync(
    path.join(__dirname, '..', outputDir, 'dependency-graph.json'),
    JSON.stringify(graphData, null, 2)
  );
  
  console.log(`\nDependency matrix written to ${outputDir}/dependency-matrix.json`);
  console.log(`Dependency graph data written to ${outputDir}/dependency-graph.json`);
  
  // Print some stats
  const totalDependencies = Object.values(dependencyMatrix).reduce((sum, deps) => sum + deps.length, 0);
  const taskWithMostDependencies = Object.entries(dependencyMatrix)
    .reduce((max, [taskId, deps]) => deps.length > max.count ? { taskId, count: deps.length } : max, { taskId: null, count: 0 });
  
  console.log(`\nTotal dependencies identified: ${totalDependencies}`);
  console.log(`Tasks with dependencies: ${Object.keys(dependencyMatrix).length}`);
  if (taskWithMostDependencies.taskId) {
    const task = tasks.find(t => t.id.toString() === taskWithMostDependencies.taskId);
    console.log(`Task with most dependencies: #${taskWithMostDependencies.taskId} - ${task ? task.description : 'Unknown'} (${taskWithMostDependencies.count} dependencies)`);
  }
}

/**
 * Build a priority heatmap for tasks
 * @param {string} sourceFile - Source file name ('perfectflow' or 'greatchat')
 * @param {string} outputDir - Directory to write output files
 */
async function buildPriorityHeatmap(sourceFile, outputDir) {
  console.log(`Building priority heatmap from ${sourceFile}.md...`);
  
  const { tasks, sections } = parseTasksFromMarkdown(sourceFile);
  const jsonTasks = parseTasksFromJSON();
  
  try {
    // Load dependency matrix if it exists
    let dependencyMatrix = {};
    try {
      const dependencyData = fs.readFileSync(
        path.join(__dirname, '..', outputDir, 'dependency-matrix.json'),
        'utf8'
      );
      dependencyMatrix = JSON.parse(dependencyData);
    } catch (error) {
      console.log('No dependency matrix found, building one...');
      await buildDependencyMatrix(sourceFile, outputDir);
      
      try {
        const dependencyData = fs.readFileSync(
          path.join(__dirname, '..', outputDir, 'dependency-matrix.json'),
          'utf8'
        );
        dependencyMatrix = JSON.parse(dependencyData);
      } catch (innerError) {
        console.error('Failed to build dependency matrix:', innerError.message);
      }
    }
    
    // Calculate priority scores
    const priorityScores = {};
    
    // Calculate basic priority score based on dependencies
    tasks.forEach(task => {
      const taskId = task.id.toString();
      
      // Base score
      let score = 50; // Default medium priority
      
      // Adjust score based on action type
      const actionScores = {
        'Define': 80,   // High priority for definition tasks
        'Establish': 75,
        'Design': 70, 
        'Create': 65,
        'Document': 60,
        'Implement': 55,
        'Integrate': 50,
        'Validate': 45,
        'Test': 40,
        'Refine': 35,
        'Optimize': 30,
        'Automate': 25
      };
      
      if (actionScores[task.action]) {
        score = actionScores[task.action];
      }
      
      // Adjust score based on number of dependencies
      const dependents = Object.entries(dependencyMatrix)
        .filter(([_, deps]) => deps.includes(parseInt(taskId)))
        .map(([depId, _]) => parseInt(depId));
      
      // Tasks that many other tasks depend on should be higher priority
      score += dependents.length * 5;
      
      // Tasks that depend on many others should be lower priority
      const dependencies = dependencyMatrix[taskId] || [];
      score -= dependencies.length * 2;
      
      // Adjust based on section (earlier sections generally higher priority)
      const sectionIndex = sections.findIndex(s => s.title === task.section);
      score += Math.max(0, 10 - sectionIndex * 2);
      
      // Store the calculated score
      priorityScores[taskId] = Math.max(0, Math.min(100, score)); // Clamp between 0-100
    });
    
    // Generate categories based on scores
    const priorityCategories = {
      critical: [],
      high: [],
      medium: [],
      low: []
    };
    
    for (const taskId in priorityScores) {
      const score = priorityScores[taskId];
      const task = tasks.find(t => t.id.toString() === taskId);
      
      if (!task) continue;
      
      if (score >= 80) {
        priorityCategories.critical.push(task);
      } else if (score >= 60) {
        priorityCategories.high.push(task);
      } else if (score >= 40) {
        priorityCategories.medium.push(task);
      } else {
        priorityCategories.low.push(task);
      }
    }
    
    // Create heatmap data
    const heatmapData = {
      scores: priorityScores,
      categories: priorityCategories,
      taskCount: {
        critical: priorityCategories.critical.length,
        high: priorityCategories.high.length,
        medium: priorityCategories.medium.length,
        low: priorityCategories.low.length
      },
      sectionHeatmap: {}
    };
    
    // Create section-based heatmap
    sections.forEach(section => {
      const sectionTasks = section.tasks.map(t => t.id.toString());
      const sectionScores = sectionTasks.map(id => priorityScores[id] || 0);
      
      if (sectionScores.length > 0) {
        const avgScore = sectionScores.reduce((sum, score) => sum + score, 0) / sectionScores.length;
        
        heatmapData.sectionHeatmap[section.title] = {
          averageScore: Math.round(avgScore),
          taskCount: sectionTasks.length,
          criticalCount: sectionTasks.filter(id => priorityScores[id] >= 80).length,
          highCount: sectionTasks.filter(id => priorityScores[id] >= 60 && priorityScores[id] < 80).length,
          mediumCount: sectionTasks.filter(id => priorityScores[id] >= 40 && priorityScores[id] < 60).length,
          lowCount: sectionTasks.filter(id => priorityScores[id] < 40).length
        };
      }
    });
    
    // Save the heatmap data
    fs.writeFileSync(
      path.join(__dirname, '..', outputDir, 'priority-heatmap.json'),
      JSON.stringify(heatmapData, null, 2)
    );
    
    // Generate a visual report
    let report = '# Priority Heatmap Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;
    report += `Source: ${sourceFile}.md\n\n`;
    
    report += '## Summary\n\n';
    report += `- Total tasks: ${tasks.length}\n`;
    report += `- Critical priority tasks: ${heatmapData.taskCount.critical}\n`;
    report += `- High priority tasks: ${heatmapData.taskCount.high}\n`;
    report += `- Medium priority tasks: ${heatmapData.taskCount.medium}\n`;
    report += `- Low priority tasks: ${heatmapData.taskCount.low}\n\n`;
    
    report += '## Section Heatmap\n\n';
    report += '| Section | Avg Score | Critical | High | Medium | Low | Total |\n';
    report += '|---------|-----------|----------|------|--------|-----|-------|\n';
    
    for (const section in heatmapData.sectionHeatmap) {
      const data = heatmapData.sectionHeatmap[section];
      report += `| ${section} | ${data.averageScore} | ${data.criticalCount} | ${data.highCount} | ${data.mediumCount} | ${data.lowCount} | ${data.taskCount} |\n`;
    }
    
    report += '\n## Critical Priority Tasks\n\n';
    priorityCategories.critical.slice(0, 20).forEach(task => {
      report += `- #${task.id}: ${task.description} [${task.section}] (Score: ${priorityScores[task.id.toString()]})\n`;
    });
    
    if (priorityCategories.critical.length > 20) {
      report += `- ... and ${priorityCategories.critical.length - 20} more\n`;
    }
    
    fs.writeFileSync(
      path.join(__dirname, '..', outputDir, 'priority-heatmap-report.md'),
      report
    );
    
    console.log(`\nPriority heatmap written to ${outputDir}/priority-heatmap.json`);
    console.log(`Priority heatmap report written to ${outputDir}/priority-heatmap-report.md`);
    
    console.log('\nPriority Summary:');
    console.log(`- Critical: ${heatmapData.taskCount.critical} tasks`);
    console.log(`- High: ${heatmapData.taskCount.high} tasks`);
    console.log(`- Medium: ${heatmapData.taskCount.medium} tasks`);
    console.log(`- Low: ${heatmapData.taskCount.low} tasks`);
  } catch (error) {
    console.error('Error building priority heatmap:', error);
  }
}

/**
 * Identify missing features based on tasks and requirements
 * @param {string} sourceFile - Source file name ('perfectflow' or 'greatchat')
 * @param {string} outputDir - Directory to write output files
 */
async function identifyMissingFeatures(sourceFile, outputDir) {
  console.log(`Identifying missing features from ${sourceFile}.md...`);
  
  const { tasks, sections } = parseTasksFromMarkdown(sourceFile);
  const jsonTasks = parseTasksFromJSON();
  
  // Extract requirements from JSON tasks
  const definedRequirements = new Set();
  jsonTasks.forEach(task => {
    // Add main task title and description
    definedRequirements.add(task.title.toLowerCase());
    
    if (task.description) {
      const keyPhrases = extractKeyPhrases(task.description);
      keyPhrases.forEach(phrase => definedRequirements.add(phrase.toLowerCase()));
    }
    
    if (task.details) {
      const keyPhrases = extractKeyPhrases(task.details);
      keyPhrases.forEach(phrase => definedRequirements.add(phrase.toLowerCase()));
    }
    
    // Add subtask titles and descriptions
    if (task.subtasks) {
      task.subtasks.forEach(subtask => {
        definedRequirements.add(subtask.title.toLowerCase());
        
        if (subtask.description) {
          const keyPhrases = extractKeyPhrases(subtask.description);
          keyPhrases.forEach(phrase => definedRequirements.add(phrase.toLowerCase()));
        }
      });
    }
  });
  
  // Extract key objects from perfectflow tasks
  const keyObjects = new Set();
  tasks.forEach(task => {
    keyObjects.add(task.object.toLowerCase());
  });
  
  // Find potential missing features (objects in perfectflow not covered in requirements)
  const potentialMissingFeatures = Array.from(keyObjects)
    .filter(object => {
      // Check if this object or a similar one is in defined requirements
      return !Array.from(definedRequirements).some(req => 
        req.includes(object) || 
        object.includes(req) ||
        calculateSimilarity(object, req) > 0.7
      );
    });
  
  if (potentialMissingFeatures.length > 0) {
    // Test OpenAI connection
    let useHeuristicApproach = false;
    try {
      console.log('Testing OpenAI connection...');
      await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'user', content: 'Test connection' }
        ],
        max_tokens: 5
      });
      console.log('OpenAI connection successful, using AI-powered feature analysis');
    } catch (error) {
      console.warn('OpenAI API connection failed:', error.message);
      console.log('Falling back to heuristic feature analysis...');
      useHeuristicApproach = true;
    }
    
    let missingFeatures;
    
    if (useHeuristicApproach) {
      // Create a heuristic grouping of the missing features
      console.log('Using heuristic approach to group missing features...');
      
      // Basic grouping by keyword similarity
      const featureGroups = [];
      const processedObjects = new Set();
      
      // Common categories for grouping based on typical feature types
      const knownCategories = [
        { name: "UI Components", keywords: ["button", "modal", "form", "input", "display", "view", "page", "panel", "theme", "layout", "section"] },
        { name: "Authentication", keywords: ["login", "auth", "authentication", "password", "user", "credential", "session", "token", "security"] },
        { name: "Data Storage", keywords: ["database", "storage", "cache", "persist", "save", "retrieve", "fetch", "load", "record", "backup"] },
        { name: "API Integration", keywords: ["api", "endpoint", "service", "request", "response", "client", "server", "http", "rest", "integration"] },
        { name: "Analytics", keywords: ["metric", "track", "analytic", "report", "statistic", "measure", "monitor", "log", "event"] },
        { name: "Performance", keywords: ["optimiz", "performance", "speed", "efficient", "cache", "load", "fast", "responsive"] },
        { name: "User Experience", keywords: ["flow", "journey", "ui", "ux", "experience", "interface", "interaction", "usability"] },
      ];
      
      // First pass: Group by known categories
      for (const category of knownCategories) {
        const matchingObjects = potentialMissingFeatures.filter(obj => 
          !processedObjects.has(obj) && 
          category.keywords.some(keyword => obj.includes(keyword))
        );
        
        if (matchingObjects.length > 0) {
          featureGroups.push({
            name: category.name,
            description: `Features related to ${category.name.toLowerCase()}`,
            priority: "medium", // Default priority
            objects: matchingObjects,
            possibleDependencies: []
          });
          
          // Mark as processed
          matchingObjects.forEach(obj => processedObjects.add(obj));
        }
      }
      
      // Second pass: Group remaining items by word similarity
      const remainingObjects = potentialMissingFeatures.filter(obj => !processedObjects.has(obj));
      
      while (remainingObjects.length > 0) {
        const currentObject = remainingObjects.shift();
        processedObjects.add(currentObject);
        
        // Find similar objects based on word similarity
        const similarObjects = remainingObjects.filter(obj => 
          calculateObjectSimilarity(currentObject, obj) > 0.4
        );
        
        // Add the current object and its similar objects to a new group
        if (similarObjects.length > 0) {
          const mainWords = currentObject.split(/\W+/).filter(w => w.length > 3);
          const groupName = mainWords.length > 0 
            ? `${mainWords[0].charAt(0).toUpperCase() + mainWords[0].slice(1)} Features`
            : "Miscellaneous Features";
          
          featureGroups.push({
            name: groupName,
            description: `Features related to ${currentObject}`,
            priority: "medium", // Default priority
            objects: [currentObject, ...similarObjects],
            possibleDependencies: []
          });
          
          // Remove the similar objects from remaining objects
          similarObjects.forEach(obj => {
            const index = remainingObjects.indexOf(obj);
            if (index > -1) {
              remainingObjects.splice(index, 1);
              processedObjects.add(obj);
            }
          });
        } else {
          // No similar objects, create a single-item group
          featureGroups.push({
            name: `${currentObject.charAt(0).toUpperCase() + currentObject.slice(1)} Feature`,
            description: `Features related to ${currentObject}`,
            priority: "low", // Lower priority for isolated features
            objects: [currentObject],
            possibleDependencies: []
          });
        }
      }
      
      // Assign priorities based on group size and keywords
      featureGroups.forEach(group => {
        // Larger groups get higher priority
        if (group.objects.length > 5) {
          group.priority = "high";
        } else if (group.objects.length > 2) {
          group.priority = "medium";
        } else {
          group.priority = "low";
        }
        
        // Certain keywords suggest higher priority
        const highPriorityKeywords = ["core", "key", "critical", "essential", "main", "primary"];
        if (group.objects.some(obj => highPriorityKeywords.some(keyword => obj.includes(keyword)))) {
          group.priority = "high";
        }
      });
      
      missingFeatures = { featureGroups };
      
    } else {
      // Use OpenAI to analyze and group missing features
      const prompt = `
I have identified ${potentialMissingFeatures.length} potential missing features in our project tasks.
These are objects mentioned in our task list that don't appear to be covered in our formal requirements.

Objects:
${potentialMissingFeatures.join('\n')}

Please analyze these objects and:
1. Group them into logical feature categories
2. Provide a brief description of what each feature category might involve
3. Suggest a priority level (high, medium, low) for each feature category
4. Identify any dependencies between these missing features and existing features

Return your analysis as a JSON object with the following structure:
{
  "featureGroups": [
    {
      "name": "Feature Category Name",
      "description": "Description of what this feature category entails",
      "priority": "high|medium|low",
      "objects": ["object1", "object2", ...],
      "possibleDependencies": ["Existing feature 1", "Existing feature 2", ...]
    },
    ...
  ]
}
`;
      
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo-json-mode',
          messages: [
            { role: 'system', content: 'You are a product management assistant specializing in feature analysis. Respond in valid JSON format only.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.5
        });
        
        const content = response.choices[0]?.message.content;
        if (content) {
          missingFeatures = JSON.parse(content);
        }
      } catch (error) {
        console.error('Error analyzing missing features with OpenAI:', error.message);
        console.log('Switching to heuristic approach...');
        // Recursive call using heuristic approach
        useHeuristicApproach = true;
        return await identifyMissingFeatures(sourceFile, outputDir);
      }
    }
    
    if (missingFeatures) {
      // Write missing features to file
      fs.writeFileSync(
        path.join(__dirname, '..', outputDir, 'missing-features.json'),
        JSON.stringify(missingFeatures, null, 2)
      );
      
      // Generate a report
      let report = '# Missing Features Report\n\n';
      report += `Generated: ${new Date().toISOString()}\n\n`;
      report += `Source: ${sourceFile}.md\n\n`;
      report += `## Summary\n\n`;
      report += `- Total missing feature objects identified: ${potentialMissingFeatures.length}\n`;
      report += `- Feature categories identified: ${missingFeatures.featureGroups.length}\n\n`;
      
      report += '## Feature Categories\n\n';
      
      missingFeatures.featureGroups.forEach((group, index) => {
        report += `### ${index + 1}. ${group.name} (${group.priority})\n\n`;
        report += `${group.description}\n\n`;
        report += '**Objects:**\n';
        group.objects.forEach(obj => {
          report += `- ${obj}\n`;
        });
        report += '\n**Possible Dependencies:**\n';
        if (group.possibleDependencies && group.possibleDependencies.length > 0) {
          group.possibleDependencies.forEach(dep => {
            report += `- ${dep}\n`;
          });
        } else {
          report += '- No specific dependencies identified\n';
        }
        report += '\n';
      });
      
      fs.writeFileSync(
        path.join(__dirname, '..', outputDir, 'missing-features-report.md'),
        report
      );
      
      console.log(`\nMissing features analysis written to ${outputDir}/missing-features.json`);
      console.log(`Missing features report written to ${outputDir}/missing-features-report.md`);
      
      // Print summary
      console.log(`\nIdentified ${potentialMissingFeatures.length} potentially missing feature objects`);
      console.log(`Grouped into ${missingFeatures.featureGroups.length} feature categories:`);
      missingFeatures.featureGroups.forEach(group => {
        console.log(`- ${group.name} (${group.priority}): ${group.objects.length} objects`);
      });
    }
  } else {
    console.log('No missing features identified.');
  }
}

/**
 * Wire up epic backlog from tasks
 * @param {string} sourceFile - Source file name ('perfectflow' or 'greatchat')
 * @param {string} outputDir - Directory to write output files
 */
async function wireEpicBacklog(sourceFile, outputDir) {
  console.log(`Wiring up epic backlog from ${sourceFile}.md...`);
  
  const { tasks, sections } = parseTasksFromMarkdown(sourceFile);
  
  // Group tasks by section
  const sectionTasks = {};
  sections.forEach(section => {
    sectionTasks[section.title] = section.tasks;
  });
  
  // Analyze sections and create epics
  const epics = [];
  
  for (const section in sectionTasks) {
    epics.push({
      title: section,
      description: `Tasks related to ${section}`,
      tasks: sectionTasks[section].map(task => task.id),
      taskCount: sectionTasks[section].length
    });
  }
  
  // Sort epics by task count (descending)
  epics.sort((a, b) => b.taskCount - a.taskCount);
  
  // Test OpenAI connection
  let useHeuristicApproach = false;
  try {
    console.log('Testing OpenAI connection...');
    await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: 'Test connection' }
      ],
      max_tokens: 5
    });
    console.log('OpenAI connection successful, using AI-powered epic generation');
  } catch (error) {
    console.warn('OpenAI API connection failed:', error.message);
    console.log('Falling back to heuristic epic generation...');
    useHeuristicApproach = true;
  }
  
  const enhancedEpics = [];
  
  if (useHeuristicApproach) {
    // Use heuristic approach to enhance epic details
    console.log('Using heuristic approach to generate epic details...');
    
    // Define common verbs for deliverables
    const deliverableVerbs = [
      "Create", "Implement", "Develop", "Design", "Build", "Establish", 
      "Document", "Test", "Deploy", "Integrate", "Configure", "Setup"
    ];
    
    // Define common success criteria templates
    const successCriteriaTemplates = [
      "All %s features are implemented and functional",
      "%s functionality passes all defined test cases",
      "Users can successfully %s without assistance",
      "%s meets performance benchmarks under load",
      "Documentation for %s is complete and comprehensive",
      "%s receives positive feedback from user testing",
      "All %s requirements are satisfied",
      "%s integrates properly with external systems"
    ];
    
    // Process each epic with heuristic enhancement
    for (const epic of epics) {
      const epicTasks = sectionTasks[epic.title];
      
      // Extract common action verbs and objects from tasks
      const actionVerbs = {};
      const objectKeywords = {};
      
      epicTasks.forEach(task => {
        // Count action verbs
        if (!actionVerbs[task.action]) {
          actionVerbs[task.action] = 0;
        }
        actionVerbs[task.action]++;
        
        // Extract keywords from objects
        const keywords = task.object.split(/\W+/).filter(w => w.length > 3);
        keywords.forEach(keyword => {
          if (!objectKeywords[keyword.toLowerCase()]) {
            objectKeywords[keyword.toLowerCase()] = 0;
          }
          objectKeywords[keyword.toLowerCase()]++;
        });
      });
      
      // Find top verbs and objects
      const topVerbs = Object.entries(actionVerbs)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(entry => entry[0]);
      
      const topObjects = Object.entries(objectKeywords)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(entry => entry[0]);
      
      // Generate a more descriptive title
      const titleKeyword = topObjects[0] || epic.title.split(' ')[0];
      const titleVerb = topVerbs[0] || "Implementation";
      const enhancedTitle = `${titleKeyword.charAt(0).toUpperCase() + titleKeyword.slice(1)} ${titleVerb}`;
      
      // Generate a more detailed description
      const description = `This epic focuses on the ${topVerbs.join(", ")} of ${topObjects.slice(0, 3).join(", ")} functionality. 
It includes ${epicTasks.length} tasks that cover the complete lifecycle of ${titleKeyword} feature development, 
from initial design to testing and optimization. This work ensures that the ${titleKeyword} capabilities 
meet user requirements and integrate properly with existing system components.`;
      
      // Generate key deliverables based on top objects and verbs
      const keyDeliverables = [];
      for (let i = 0; i < Math.min(4, topObjects.length); i++) {
        const verb = deliverableVerbs[Math.floor(Math.random() * deliverableVerbs.length)];
        keyDeliverables.push(`${verb} ${topObjects[i]} functionality`);
      }
      
      // Generate success criteria
      const successCriteria = [];
      for (let i = 0; i < 3; i++) {
        const template = successCriteriaTemplates[Math.floor(Math.random() * successCriteriaTemplates.length)];
        const object = topObjects[i % topObjects.length];
        successCriteria.push(template.replace('%s', object));
      }
      
      // Calculate complexity score based on task count, verb complexity, and diversity of objects
      const verbComplexityFactor = topVerbs.includes("Implement") || topVerbs.includes("Integrate") ? 1.2 : 1.0;
      const objectDiversityFactor = Object.keys(objectKeywords).length / epicTasks.length;
      const complexityScore = Math.min(10, Math.ceil((epicTasks.length / 20) * verbComplexityFactor * (1 + objectDiversityFactor) * 3));
      
      enhancedEpics.push({
        id: enhancedEpics.length + 1,
        originalTitle: epic.title,
        title: enhancedTitle,
        description: description,
        keyDeliverables: keyDeliverables,
        successCriteria: successCriteria,
        complexityScore: complexityScore,
        taskCount: epicTasks.length,
        tasks: epicTasks.map(task => task.id)
      });
      
      console.log(`Generated epic: ${enhancedTitle}`);
    }
    
  } else {
    // Use OpenAI to generate enhanced epic descriptions
    for (const epic of epics) {
      const epicTasks = sectionTasks[epic.title];
      
      // Sample tasks to create a representative set
      const sampleSize = Math.min(10, epicTasks.length);
      const sampledTasks = [];
      
      // Get tasks from beginning, middle, and end
      sampledTasks.push(epicTasks[0]);
      if (epicTasks.length > 1) {
        sampledTasks.push(epicTasks[epicTasks.length - 1]);
      }
      if (epicTasks.length > 2) {
        sampledTasks.push(epicTasks[Math.floor(epicTasks.length / 2)]);
      }
      
      // Add some random tasks to reach sample size
      while (sampledTasks.length < sampleSize) {
        const randomIndex = Math.floor(Math.random() * epicTasks.length);
        const randomTask = epicTasks[randomIndex];
        
        if (!sampledTasks.some(t => t.id === randomTask.id)) {
          sampledTasks.push(randomTask);
        }
      }
      
      const prompt = `
I'm creating an epic backlog for our project. I have a section titled "${epic.title}" with ${epicTasks.length} tasks.
Here are some representative tasks from this section:

${sampledTasks.map(task => `${task.id}. ${task.action} ${task.object}`).join('\n')}

Based on these tasks, please:
1. Create an engaging title for this epic (max 50 characters)
2. Write a comprehensive description of what this epic involves (2-3 paragraphs)
3. Identify 3-5 key deliverables for this epic
4. Suggest success criteria for this epic
5. Estimate a relative complexity score (1-10) for this epic

Return your analysis as a JSON object with the following structure:
{
  "title": "Epic title",
  "description": "Epic description",
  "keyDeliverables": ["Deliverable 1", "Deliverable 2", ...],
  "successCriteria": ["Criterion 1", "Criterion 2", ...],
  "complexityScore": 5
}
`;
      
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo-json-mode',
          messages: [
            { role: 'system', content: 'You are a product management assistant specializing in agile planning. Respond in valid JSON format only.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.5
        });
        
        const content = response.choices[0]?.message.content;
        if (content) {
          const epicDetails = JSON.parse(content);
          
          enhancedEpics.push({
            id: enhancedEpics.length + 1,
            originalTitle: epic.title,
            title: epicDetails.title,
            description: epicDetails.description,
            keyDeliverables: epicDetails.keyDeliverables,
            successCriteria: epicDetails.successCriteria,
            complexityScore: epicDetails.complexityScore,
            taskCount: epicTasks.length,
            tasks: epicTasks.map(task => task.id)
          });
          
          console.log(`Generated epic: ${epicDetails.title}`);
        }
      } catch (error) {
        console.error(`Error generating epic for ${epic.title}:`, error.message);
        console.log('Switching to heuristic approach for epic generation...');
        useHeuristicApproach = true;
        return await wireEpicBacklog(sourceFile, outputDir); // Restart with heuristic approach
      }
    }
  }
  
  // Sort epics by complexity score (descending)
  enhancedEpics.sort((a, b) => (b.complexityScore || 0) - (a.complexityScore || 0));
  
  // Write epic backlog to file
  fs.writeFileSync(
    path.join(__dirname, '..', outputDir, 'epic-backlog.json'),
    JSON.stringify(enhancedEpics, null, 2)
  );
  
  // Generate a human-readable report
  let report = '# Epic Backlog\n\n';
  report += `Generated: ${new Date().toISOString()}\n\n`;
  report += `Source: ${sourceFile}.md\n\n`;
  report += `## Summary\n\n`;
  report += `- Total epics: ${enhancedEpics.length}\n`;
  report += `- Total tasks: ${tasks.length}\n\n`;
  
  report += '## Epics\n\n';
  
  enhancedEpics.forEach((epic, index) => {
    report += `### ${index + 1}. ${epic.title}\n\n`;
    report += `**Complexity: ${epic.complexityScore || 'N/A'}** | **Tasks: ${epic.taskCount}**\n\n`;
    report += `${epic.description}\n\n`;
    
    if (epic.keyDeliverables) {
      report += '**Key Deliverables:**\n';
      epic.keyDeliverables.forEach(deliverable => {
        report += `- ${deliverable}\n`;
      });
      report += '\n';
    }
    
    if (epic.successCriteria) {
      report += '**Success Criteria:**\n';
      epic.successCriteria.forEach(criterion => {
        report += `- ${criterion}\n`;
      });
      report += '\n';
    }
    
    report += '**Tasks (sample):**\n';
    const sampleTasks = epic.tasks.slice(0, 5).map(taskId => {
      const task = tasks.find(t => t.id === taskId);
      return task ? `#${taskId}: ${task.description}` : `#${taskId}`;
    });
    sampleTasks.forEach(task => {
      report += `- ${task}\n`;
    });
    if (epic.tasks.length > 5) {
      report += `- ...and ${epic.tasks.length - 5} more tasks\n`;
    }
    report += '\n';
  });
  
  fs.writeFileSync(
    path.join(__dirname, '..', outputDir, 'epic-backlog-report.md'),
    report
  );
  
  console.log(`\nEpic backlog written to ${outputDir}/epic-backlog.json`);
  console.log(`Epic backlog report written to ${outputDir}/epic-backlog-report.md`);
  
  console.log(`\nGenerated ${enhancedEpics.length} epics:`);
  enhancedEpics.slice(0, 5).forEach(epic => {
    console.log(`- ${epic.title} (Complexity: ${epic.complexityScore || 'N/A'}, Tasks: ${epic.taskCount})`);
  });
  if (enhancedEpics.length > 5) {
    console.log(`- ...and ${enhancedEpics.length - 5} more epics`);
  }
}

/**
 * Extract key phrases from text
 * @param {string} text - Text to extract phrases from
 * @returns {Array} Array of key phrases
 */
function extractKeyPhrases(text) {
  if (!text) return [];
  
  // Split text into sentences
  const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 0);
  
  // Extract noun phrases (simple approach)
  const phrases = [];
  
  sentences.forEach(sentence => {
    const words = sentence.trim().split(/\s+/);
    
    // Extract 2-3 word phrases
    for (let i = 0; i < words.length - 1; i++) {
      phrases.push(`${words[i]} ${words[i + 1]}`.toLowerCase());
      
      if (i < words.length - 2) {
        phrases.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`.toLowerCase());
      }
    }
  });
  
  return phrases;
}

/**
 * Calculate similarity between two objects from task descriptions
 * @param {string} obj1 - First object string
 * @param {string} obj2 - Second object string
 * @returns {number} Similarity score (0-1)
 */
function calculateObjectSimilarity(obj1, obj2) {
  // Convert to lowercase for comparison
  const str1 = obj1.toLowerCase();
  const str2 = obj2.toLowerCase();

  // Check for direct substring relationship
  if (str1.includes(str2) || str2.includes(str1)) {
    return 0.8;
  }

  // Check for word overlap
  const words1 = str1.split(/\W+/).filter(w => w.length > 2);
  const words2 = str2.split(/\W+/).filter(w => w.length > 2);
  
  const commonWords = words1.filter(word => words2.includes(word));
  
  if (commonWords.length > 0) {
    const overlapScore = (commonWords.length * 2) / (words1.length + words2.length);
    return Math.min(0.7, overlapScore);
  }
  
  // Calculate string similarity as a fallback
  return calculateSimilarity(str1, str2);
}

/**
 * Calculate similarity between two strings
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} Similarity score (0-1)
 */
function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) {
    return 1.0;
  }
  
  // Calculate Levenshtein distance
  const costs = [];
  for (let i = 0; i <= longer.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= shorter.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j === 0) {
        costs[j] = lastValue;
      } else {
        const substitute = costs[j - 1] + (longer.charAt(i - 1) !== shorter.charAt(j - 1) ? 1 : 0);
        const insert = costs[j] + 1;
        const del = lastValue + 1;
        costs[j - 1] = lastValue;
        lastValue = Math.min(substitute, insert, del);
      }
    }
    if (i > 0) {
      costs[shorter.length] = lastValue;
    }
  }
  
  return (longer.length - costs[shorter.length]) / longer.length;
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  parseTasksFromMarkdown,
  parseTasksFromJSON,
  analyzeTaskCoverage,
  buildDependencyMatrix,
  buildPriorityHeatmap,
  identifyMissingFeatures,
  wireEpicBacklog
};