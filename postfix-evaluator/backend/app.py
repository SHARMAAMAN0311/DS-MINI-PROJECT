import re

from flask import Flask, jsonify, request, send_from_directory

from stack import Stack

app = Flask(__name__, static_folder='../frontend', static_url_path='')
OPERATORS = {'+', '-', '*', '/', '%', '^'}


def tokenize_expression(expression):
    expression = expression.strip()
    if any(character.isspace() for character in expression):
        return expression.split()

    if re.fullmatch(r'[0-9+\-*/%^]+', expression):
        return list(expression)

    tokens = re.findall(r'\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|[+\-*/%^]', expression)
    if ''.join(tokens) != expression:
        raise ValueError('Invalid expression. Use numbers and supported operators only.')
    return tokens


def evaluate_postfix_expression(expression):
    tokens = tokenize_expression(expression)
    if not tokens:
        raise ValueError('Expression cannot be empty.')

    stack = Stack()
    steps = []
    operations = 0

    for number, token in enumerate(tokens, start=1):
        stack_before = list(stack.items)

        if token in OPERATORS:
            if stack.size() < 2:
                raise ValueError(f"The '{token}' operator needs two operands.")

            right = stack.pop()
            left = stack.pop()

            if token == '+':
                result = left + right
            elif token == '-':
                result = left - right
            elif token == '*':
                result = left * right
            elif token == '/':
                if right == 0:
                    raise ZeroDivisionError('Division by zero is not allowed.')
                result = left / right
            elif token == '%':
                if right == 0:
                    raise ZeroDivisionError('Modulo by zero is not allowed.')
                result = left % right
            else:
                result = left ** right

            if isinstance(result, float) and result.is_integer():
                result = int(result)

            symbol = '×' if token == '*' else token
            operation = f'{left} {symbol} {right} = {result}'
            explanation = (
                f'The {token} operator pops {right} and {left}, calculates '
                f'{left} {symbol} {right}, then pushes {result} onto the stack.'
            )
            action = 'Calculate'
            stack.push(result)
            operations += 1
        else:
            try:
                value = float(token) if '.' in token or 'e' in token.lower() else int(token)
            except ValueError:
                raise ValueError(
                    f"Invalid token '{token}'. Use numbers and supported operators only."
                )

            if isinstance(value, float) and value.is_integer():
                value = int(value)

            stack.push(value)
            operation = f'Push {value}'
            explanation = f'{value} is a number, so it is pushed onto the stack.'
            action = 'Push'

        steps.append({
            'step': number,
            'token': token,
            'action': action,
            'operation': operation,
            'stackBefore': stack_before,
            'stackAfter': list(stack.items),
            'explanation': explanation,
        })

    if stack.size() != 1:
        raise ValueError('Invalid postfix expression. Too many operands remain.')

    return {
        'success': True,
        'result': stack.peek(),
        'steps': steps,
        'tokens': len(tokens),
        'operations': operations,
    }


@app.route('/evaluate', methods=['POST'])
def evaluate():
    data = request.get_json(silent=True)
    expression = data.get('expression') if isinstance(data, dict) else None
    if not isinstance(expression, str) or not expression.strip():
        return jsonify({'success': False, 'error': 'Expression cannot be empty.'}), 400

    try:
        return jsonify(evaluate_postfix_expression(expression))
    except (ValueError, ZeroDivisionError) as error:
        return jsonify({'success': False, 'error': str(error)}), 400


@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
