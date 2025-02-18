$(document).ready(function() {
    window.scrollTo(0, 0);

    $('#selection').change(function() {
        $('.form-section').hide();
        $('#bmiValue').html('');
        $('#qrcode').html('');
        $('#qrText').html('');

        if ($(this).val() === 'bmi') {
            $('#bmiForm').show();
        } else if ($(this).val() === 'meal') {
            $('#mealForm').show();
        }
    });

    $('#bmiForm').on('submit', function(event) {
        event.preventDefault();

        const height = $('#height').val();
        const weight = $('#weight').val();
        const condition = $('#condition').val();

        if (!height || !weight || !condition) {
            alert('全ての項目を入力してください。');
            return;
        }

        const heightInMeters = parseFloat(height) / 100;
        const weightInKg = parseFloat(weight);
        const bmi = (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);

        const today = new Date();
        const dateString = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;

        const message = `今日は${dateString}です。<br>今日のあなたのBMIは${bmi}です。<br>体調は${condition}です。`;
        $('#bmiValue').html(message);

        const qrData = `文書コード：999001\n入力日：${dateString}\n身長：${height}cm　体重：${weight}kg　BMI ${bmi}\n体調：${condition}`;
        const encodedData = Encoding.convert(qrData, { to: 'SJIS', type: 'string' });

        generateQRCode(encodedData);
        $('#qrText').html(qrData.replace(/\n/g, '<br>'));
    });

    $('#mainDish').on('input', function() {
        $('#mainDishValue').text($(this).val());
    });

    $('#sideDish').on('input', function() {
        $('#sideDishValue').text($(this).val());
    });

    $('#confirmButton').click(function() {
        const mainDish = $('#mainDish').val();
        const sideDish = $('#sideDish').val();
        const notes = $('#notes').val() || 'なし';

        if (!mainDish || !sideDish) {
            alert('主食と副食の摂取量を入力してください。');
            return;
        }

        const message = `主食：${mainDish}　副食：${sideDish}　自由記載：${notes}`;
        $('#bmiValue').html(message);

        const qrData = `文書コード：999002\n主食：${mainDish}　副食：${sideDish}　自由記載：${notes}`;
        const encodedData = Encoding.convert(qrData, { to: 'SJIS', type: 'string' });

        generateQRCode(encodedData);
        $('#qrText').html(qrData.replace(/\n/g, '<br>'));
    });

    function generateQRCode(data) {
        $('#qrcode').html('').qrcode({
            width: 256,
            height: 256,
            text: data
        });
    }
});
