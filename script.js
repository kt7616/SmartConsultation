$(document).ready(function() {
    window.scrollTo(0, 0);

    $('#selection').change(function() {
        $('.form-section').hide();
        $('#bmiValue').html('');
        $('#qrcode').html('');
        $('#qrText').html('');

        // 項目選択のメッセージとプルダウンを非表示にする
        $('#selection').prev('label').hide();
        $('#selection').hide();

        // タイトルを変更する
        const selectedValue = $(this).val();
        let titleText = 'スマート問診アプリ';
        if (selectedValue === 'bmi') {
            titleText = 'BMI';
            $('#bmiForm').show();
        } else if (selectedValue === 'meal') {
            titleText = '食事内容';
            $('#mealForm').show();
        } else if (selectedValue === 'ipss' || selectedValue === 'ipssSlider') {
            titleText = 'IPSSスコア';
            if (selectedValue === 'ipss') {
                $('#ipssForm').show();
            } else {
                $('#ipssSliderForm').show();
            }
        }
        $('h1').text(titleText); // タイトルを更新
    });

    const ipssDescriptions = [
        "全くない", "5回に1回の割合より少ない", "2回に1回の割合より少ない",
        "2回に1回の割合くらい", "2回に1回の割合より多い", "ほとんどいつも"
    ];

    const ipssNightDescriptions = [
        "0回", "1回", "2回", "3回", "4回", "5回以上"
    ];

    const qolDescriptions = [
        "とても満足", "満足", "ほぼ満足", "なんともいえない",
        "やや不満", "いやだ", "とてもいやだ"
    ];

    $('#ipssSliderQuestion1, #ipssSliderQuestion2, #ipssSliderQuestion3, #ipssSliderQuestion4, #ipssSliderQuestion5, #ipssSliderQuestion6').on('input', function() {
        const id = $(this).attr('id');
        const value = $(this).val();
        $(`#${id}Value`).text(ipssDescriptions[value]);
    });

    $('#ipssSliderQuestion7').on('input', function() {
        const value = $(this).val();
        $('#ipssSliderQuestion7Value').text(ipssNightDescriptions[value]);
    });

    $('#qolSliderQuestion').on('input', function() {
        const value = $(this).val();
        $('#qolSliderQuestionValue').text(qolDescriptions[value]);
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
        
        // メールリンクを追加
        const mailBody = encodeURIComponent(qrData);
        const mailLink = `<a href="mailto:example@example.com?subject=BMI測定結果&body=${mailBody}" class="mail-link">メールで送信</a>`;
        $('#mailLink').html(mailLink);
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

        const today = new Date();
        const dateString = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;

        const message = `主食：${mainDish}　副食：${sideDish}　自由記載：${notes}`;
        $('#bmiValue').html(message);

        const qrData = `文書コード：999002\n入力日：${dateString}\n主食：${mainDish}　副食：${sideDish}　自由記載：${notes}`;
        const encodedData = Encoding.convert(qrData, { to: 'SJIS', type: 'string' });

        generateQRCode(encodedData);
        $('#qrText').html(qrData.replace(/\n/g, '<br>'));

        // メールリンクを追加
        const mailBody = encodeURIComponent(qrData);
        const mailLink = `<a href="mailto:example@example.com?subject=食事内容記録&body=${mailBody}" class="mail-link">メールで送信</a>`;
        $('#mailLink').html(mailLink);
    });

    $('#ipssConfirmButton').click(function() {
        const ipssScores = [
            parseInt($('#ipssQuestion1').val()),
            parseInt($('#ipssQuestion2').val()),
            parseInt($('#ipssQuestion3').val()),
            parseInt($('#ipssQuestion4').val()),
            parseInt($('#ipssQuestion5').val()),
            parseInt($('#ipssQuestion6').val()),
            parseInt($('#ipssQuestion7').val())
        ];

        const qolScore = parseInt($('#qolQuestion').val());

        if (ipssScores.includes(NaN) || isNaN(qolScore)) {
            alert('全ての項目を入力してください。');
            return;
        }

        const today = new Date();
        const dateString = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;

        const ipssTotal = ipssScores.reduce((a, b) => a + b, 0);
        const ipssScoresText = `IPSS：${ipssScores.join('-')}`;
        const message = `${ipssScoresText}<br>IPSS合計点：${ipssTotal}点<br>QOLスコア：${qolScore}点`;
        $('#bmiValue').html(message);

        const qrData = `文書コード：999003\n入力日：${dateString}\n${ipssScoresText}\nIPSS合計点：${ipssTotal}点\nQOLスコア：${qolScore}点`;
        const encodedData = Encoding.convert(qrData, { to: 'SJIS', type: 'string' });

        generateQRCode(encodedData);
        $('#qrText').html(qrData.replace(/\n/g, '<br>'));

        // メールリンクを追加
        const mailBody = encodeURIComponent(qrData);
        const mailLink = `<a href="mailto:example@example.com?subject=IPSSスコア結果&body=${mailBody}" class="mail-link">メールで送信</a>`;
        $('#mailLink').html(mailLink);
    });

    $('#ipssSliderConfirmButton').click(function() {
        const ipssScores = [
            parseInt($('#ipssSliderQuestion1').val()),
            parseInt($('#ipssSliderQuestion2').val()),
            parseInt($('#ipssSliderQuestion3').val()),
            parseInt($('#ipssSliderQuestion4').val()),
            parseInt($('#ipssSliderQuestion5').val()),
            parseInt($('#ipssSliderQuestion6').val()),
            parseInt($('#ipssSliderQuestion7').val())
        ];

        const qolScore = parseInt($('#qolSliderQuestion').val());

        if (ipssScores.includes(NaN) || isNaN(qolScore)) {
            alert('全ての項目を入力してください。');
            return;
        }

        const today = new Date();
        const dateString = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;

        const ipssTotal = ipssScores.reduce((a, b) => a + b, 0);
        const ipssScoresText = `IPSS：${ipssScores.join('-')}`;
        const message = `${ipssScoresText}<br>IPSS合計点：${ipssTotal}点<br>QOLスコア：${qolScore}点`;
        $('#bmiValue').html(message);

        const qrData = `文書コード：999004\n入力日：${dateString}\n${ipssScoresText}\nIPSS合計点：${ipssTotal}点\nQOLスコア：${qolScore}点`;
        const encodedData = Encoding.convert(qrData, { to: 'SJIS', type: 'string' });

        generateQRCode(encodedData);
        $('#qrText').html(qrData.replace(/\n/g, '<br>'));

        // メールリンクを追加
        const mailBody = encodeURIComponent(qrData);
        const mailLink = `<a href="mailto:example@example.com?subject=IPSSスコア結果（スライダー）&body=${mailBody}" class="mail-link">メールで送信</a>`;
        $('#mailLink').html(mailLink);
    });

    function generateQRCode(data) {
        $('#qrcode').html('').qrcode({
            width: 256,
            height: 256,
            text: data
        });
    }
});
