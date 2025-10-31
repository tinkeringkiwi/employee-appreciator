from flask import Flask, jsonify, request
from image import generate_appreciation
from pprint import pprint

app = Flask(__name__)


@app.route('/api/appreciate', methods=['POST'])
def appreciate_employee():
    """Accept JSON {"employee_image": "<base64>", "appreciations": [..], "format": "JPEG"}
    Returns JSON {"image_b64": "<base64>"}
    """
    data = request.get_json()
    pprint(data)
    if not data or 'employee_image' not in data:
        return jsonify({'error': 'employee_image (base64) is required'}), 400

    employee_b64 = data['employee_image']
    appreciations = data.get('appreciations')
    out_format = data.get('format', 'JPEG')

    try:
        result_b64 = generate_appreciation(employee_b64, appreciations=appreciations, output_format=out_format)
    except FileNotFoundError as e:
        return jsonify({'error': str(e)}), 500
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'internal server error', 'detail': str(e)}), 500

    return jsonify({'image_b64': result_b64})


if __name__ == '__main__':
    app.run(debug=True, port=8081)