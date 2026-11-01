# Postfix Expression Evaluator

A complete, modern, responsive Postfix Expression Evaluator website built for an engineering college mini-project. This project demonstrates **Postfix Expression Evaluation using Stack Data Structure** implemented in Python.

## Features

- **Stack Implementation in Python** - Custom Stack class with push(), pop(), peek(), is_empty(), size() methods
- **Step-by-Step Visualization** - See how the stack works at each step of evaluation
- **Modern Dark UI** - Premium glass-effect design with animations
- **Interactive Learning** - Infix/postfix and stack explanations
- **Voice Explanation** - Listen to the current step or all evaluation steps
- **Support for Multiple Operators** - +, -, *, /, %, ^
- **Multi-digit Numbers** - Supports numbers like 25, 123 etc.
- **Correct Operand Order** - Handles subtraction and division correctly

## Technology Stack

### Frontend
- HTML5
- CSS3 (Modern animations and glass effects)
- Vanilla JavaScript

### Backend
- Python
- Flask

### Data Structure
- Stack implemented in Python

## Project Structure

```
postfix-expression-evaluator/
│
├── frontend/
│   ├── index.html      # Main HTML file
│   ├── style.css       # Styling and animations
│   └── script.js       # Frontend logic
│
├── backend/
│   ├── app.py          # Flask API server
│   └── stack.py        # Stack data structure implementation
│
└── README.md
```

## Setup Instructions

### Prerequisites
- Python 3.9 or higher
- pip (Python package manager)

### Installation

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the Flask server**
   ```bash
   python app.py
   ```

4. **Open in browser**
   Navigate to `http://localhost:5000`

## How to Use

1. Enter a space-separated postfix expression (e.g., `5 6 2 + *`). Compact single-digit input such as `562+*` is also supported.
2. Click "Evaluate" to get the result
3. Click "View Step-by-Step" to see detailed visualization
4. Use the controls to navigate through steps, play animation, or reset
5. Use the Learn window for explanations and the voice buttons to hear steps

## Examples

| Postfix Expression | Result | Explanation |
|-------------------|--------|-------------|
| `5 6 2 + *` | 40 | (5 * (6 + 2)) = 40 |
| `25 5 / 3 +` | 8 | ((25 / 5) + 3) = 8 |
| `8 2 -` | 6 | (8 - 2) = 6 |
| `8 2 /` | 4 | (8 / 2) = 4 |
| `5 6 + 2 *` | 22 | ((5 + 6) * 2) = 22 |
| `2 3 ^` | 8 | (2 ^ 3) = 8 |

## API Endpoint

**POST /evaluate**

Request:
```json
{
    "expression": "5 6 2 + *"
}
```

Response:
```json
{
    "result": 40,
    "steps": [
        {
            "step": 1,
            "token": "5",
            "action": "Push",
            "stackBefore": [],
            "operation": "-",
            "stackAfter": [5],
            "explanation": "5 is an operand, so it is pushed onto the stack."
        }
        // ... more steps
    ],
    "tokens": 5,
    "operations": 2
}
```

## Learning Objectives

- Understanding Stack Data Structure (LIFO)
- Postfix Expression Evaluation Algorithm
- Difference between Infix and Postfix notation
- Operator precedence in postfix expressions
- Stack operations in real applications

## Notes

- Separate multi-digit numbers with spaces
- Division is floating point but converted to int if result is whole number
- Proper operand order is maintained (e.g., `8 2 -` gives 6, not -6)
- The evaluation is done entirely in Python backend using custom Stack class
- No JavaScript evaluation is used

## Made By

Aman Sharma and Suraj Shetkar  
Nutan Maharashtra Institute of Technology
