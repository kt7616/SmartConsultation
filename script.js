$(document).ready(function() {
    window.scrollTo(0, 0);

    // フォームに入力があったかどうかのフラグ
    let hasUserInput = false;
    
    // フォームの入力を監視
    $('input, select, textarea').on('change', function() {
        hasUserInput = true;
    });
    
    // メールリンクをクリックした時にフラグをリセット
    $(document).on('click', '.mail-link', function() {
        // メール送信前に一時的にフラグをfalseに設定
        const tempHasUserInput = hasUserInput;
        hasUserInput = false;
        
        // 少し遅延させてフラグを元に戻す（メールクライアントが開いた後）
        setTimeout(function() {
            hasUserInput = tempHasUserInput;
        }, 100);
    });
    
    // ページを離れる前や再読み込み時の確認
    window.addEventListener('beforeunload', function(e) {
        if (hasUserInput) {
            // 標準的なメッセージ（ブラウザによって実際の表示は異なる）
            const confirmationMessage = '再読み込みすると、ここまで入力したデータは全て消去されます。よろしいですか？';
            e.returnValue = confirmationMessage;  // Chrome, Firefox, IE
            return confirmationMessage;           // Safari
        }
    });

    $('#selection').change(function() {
        $('.form-section').hide();
        $('#bmiValue').html('');
        $('#qrcode').html('');
        $('#qrText').html('');
        $('#mailLink').html('');

        // 項目選択のメッセージとプルダウンを非表示にする
        $('#selection').prev('label').hide();
        $('#selection').hide();

        // タイトルを変更する
        const selectedValue = $(this).val();
        let titleText = 'スマート問診アプリ';
            if (selectedValue === 'ipss') {
            titleText = 'IPSS-QOLスコア';
                $('#ipssForm').show();
        } else if (selectedValue === 'ctcae') {
            titleText = 'CTCAE（前立腺癌）';
            $('#ctcaeForm').show();
        } else if (selectedValue === 'epic') {
            titleText = 'EPIC（前立腺癌QOL）';
            $('#epicForm').show();
        } else if (selectedValue === 'eq5d') {
            titleText = 'EQ-5D';
            $('#eq5dForm').show();
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

    // 選択されたフォームを保存する配列
    let selectedForms = [];
    let currentFormIndex = 0;
    let formResults = {};

    // 開始ボタンのクリックイベント
    $('#startButton').click(function() {
        // 選択されたフォームを取得
        selectedForms = [];
        $('input[name="selected_forms"]:checked').each(function() {
            selectedForms.push($(this).val());
        });

        if (selectedForms.length === 0) {
            alert('少なくとも1つの項目を選択してください。');
            return;
        }

        // 項目選択部分を非表示にする
        $('.item-selection').hide();
        
        // 進行状況表示を初期化して表示
        $('#currentFormIndex').text(1);
        $('#totalForms').text(selectedForms.length);
        $('#progressBar').css('width', `${(1 / selectedForms.length) * 100}%`);
        $('.progress-indicator').show();
        
        // ナビゲーションボタンを各フォームに追加
        if (!$('#ipssForm .nav-buttons').length) {
            $('#ipssForm').append('<div class="nav-buttons"><button type="button" class="nav-btn prev-btn">戻る</button><button type="button" class="nav-btn next-btn">次へ</button></div>');
        }
        
        if (!$('#ctcaeForm .nav-buttons').length) {
            $('#ctcaeForm').append('<div class="nav-buttons"><button type="button" class="nav-btn prev-btn">戻る</button><button type="button" class="nav-btn next-btn">次へ</button></div>');
        }
        
        if (!$('#eq5dForm .nav-buttons').length) {
            $('#eq5dForm').append('<div class="nav-buttons"><button type="button" class="nav-btn prev-btn">戻る</button><button type="button" class="nav-btn next-btn">次へ</button></div>');
        }
        
        // 最初のフォームを表示
        currentFormIndex = 0;
        showCurrentForm();
        
        // ナビゲーションボタンの表示を更新
        updateNavigationButtons();
        
        // ナビゲーションボタンのイベントを設定
        setupNavigationEvents();
    });

    // ナビゲーションボタンのイベントを設定する関数
    function setupNavigationEvents() {
        // 「戻る」ボタンのクリックイベント
        $('.nav-btn.prev-btn').off('click').on('click', function() {
            if (currentFormIndex > 0) {
                currentFormIndex--;
                
                // 進行状況を更新
                $('#currentFormIndex').text(currentFormIndex + 1);
                $('#progressBar').css('width', `${((currentFormIndex + 1) / selectedForms.length) * 100}%`);
                
                // 前のフォームを表示
                showCurrentForm();
            }
        });
        
        // 「次へ」ボタンのクリックイベント
        $('.nav-btn.next-btn').off('click').on('click', function() {
            // 現在のフォームのバリデーション
            const currentForm = selectedForms[currentFormIndex];
            
            if (validateForm(currentForm)) {
                // フォームの結果を保存
                saveFormResult(currentForm);
                
                // 最後のフォームの場合は最終結果を表示
                if (currentFormIndex === selectedForms.length - 1) {
                    showFinalResults();
                    return;
                }
                
                // 次のフォームに進む
                goToNextForm();
            }
        });
    }

    // ナビゲーションボタンの表示を更新する関数
    function updateNavigationButtons() {
        // 単一フォームの場合
        if (selectedForms.length === 1) {
            // ナビゲーションボタンを非表示
            $('.nav-buttons').hide();
            
            // 現在のフォームがEPICの場合は、EPICのナビゲーションボタンを表示
            if (selectedForms[0] === 'epic') {
                initEpicForm();
            } else {
                // それ以外のフォームは通常の確定ボタンを表示
                if (selectedForms[0] === 'ipss') {
                    $('#ipssConfirmButton').show();
                } else if (selectedForms[0] === 'ctcae') {
                    $('#ctcaeConfirmButton').show();
                } else if (selectedForms[0] === 'eq5d') {
                    $('#eq5dConfirmButton').show();
                }
            }
        } else {
            // 複数フォームの場合
            // 通常のフォームの確定ボタンを非表示
            $('#ipssConfirmButton, #ctcaeConfirmButton, #eq5dConfirmButton').hide();
            
            // 現在のフォームのナビゲーションボタンを表示
            $('.nav-buttons').hide().removeClass('first-form');
            $(`#${selectedForms[currentFormIndex]}Form .nav-buttons`).show();
            
            if (currentFormIndex === 0) {
                // 最初のフォーム
                $('.nav-btn.prev-btn').hide();
                $('.nav-btn.next-btn').show().text('次へ').removeClass('confirm-btn');
                // 最初のフォームの場合、ナビゲーションボタンコンテナにfirst-formクラスを追加
                $(`#${selectedForms[currentFormIndex]}Form .nav-buttons`).addClass('first-form');
            } else if (currentFormIndex === selectedForms.length - 1) {
                // 最後のフォーム
                $('.nav-btn.prev-btn').show();
                $('.nav-btn.next-btn').show().text('確定').addClass('confirm-btn');
            } else {
                // 中間のフォーム
                $('.nav-btn.prev-btn').show();
                $('.nav-btn.next-btn').show().text('次へ').removeClass('confirm-btn');
            }
            
            // 現在のフォームがEPICの場合
            if (selectedForms[currentFormIndex] === 'epic') {
                // EPICフォームのナビゲーションを初期化
                initEpicForm();
                
                // 複数フォーム用のナビゲーションボタンを非表示
                $(`#${selectedForms[currentFormIndex]}Form .nav-buttons`).hide();
            }
        }
    }

    // EPICフォームのナビゲーション
    let epicCurrentPage = 1;
    const epicTotalPages = 9;
    
    // EPICフォームの初期化
    function initEpicForm() {
        epicCurrentPage = 1;
        $('.epic-page').hide();
        $('#epicPage1').show();
        $('#epicCurrentPage').text(epicCurrentPage);
        $('#epicTotalPages').text(epicTotalPages);
        updateEpicNavButtons();
    }
    
    // EPICフォームのナビゲーションボタンの表示を更新
    function updateEpicNavButtons() {
        if (epicCurrentPage === 1) {
            // 最初のページの場合
            // 複数フォームが選択されていて、現在のフォームが最初のフォームでない場合
            if (selectedForms.length > 1 && currentFormIndex > 0) {
                $('.epic-prev-btn').prop('disabled', false).css('opacity', '1');
            } else {
                $('.epic-prev-btn').prop('disabled', true).css('opacity', '0.5');
            }
        } else {
            // 2ページ目以降の場合
            $('.epic-prev-btn').prop('disabled', false).css('opacity', '1');
        }
        
        if (epicCurrentPage === epicTotalPages) {
            // 最後のページでは「次へ」ボタンを「確定」に変更
            $('.epic-next-btn').text('確定').show();
        } else {
            $('.epic-next-btn').text('次へ').show();
        }
    }
    
    // EPICフォームの「次へ」ボタン
    $('.epic-next-btn').click(function() {
        // 現在のページの必須項目をチェック
        const currentPageInputs = $(`#epicPage${epicCurrentPage}`).find('input[type="radio"]:required');
        const currentPageQuestions = {};
        
        currentPageInputs.each(function() {
            const name = $(this).attr('name');
            currentPageQuestions[name] = true;
        });
        
        let allAnswered = true;
        for (const question in currentPageQuestions) {
            if (!$(`input[name="${question}"]:checked`).val()) {
                allAnswered = false;
                break;
            }
        }
        
        if (!allAnswered) {
            alert('全ての質問に回答してください。');
            return;
        }
        
        // 最後のページで「確定」ボタンがクリックされた場合
        if (epicCurrentPage === epicTotalPages) {
            // 全ての回答を収集
            // 排尿の状態（問1～問7）
            const urinaryAnswers = [];
            for (let i = 1; i <= 5; i++) {
                urinaryAnswers.push($(`input[name="epic_q${i}"]:checked`).val());
            }
            // 問6のサブ質問（a～f）
            for (let c = 'a'.charCodeAt(0); c <= 'f'.charCodeAt(0); c++) {
                const letter = String.fromCharCode(c);
                urinaryAnswers.push($(`input[name="epic_q6${letter}"]:checked`).val());
            }
            // 問7
            urinaryAnswers.push($(`input[name="epic_q7"]:checked`).val());
            
            // 排便とおなかの状態（問8～問16）
            const bowelAnswers = [];
            for (let i = 8; i <= 14; i++) {
                bowelAnswers.push($(`input[name="epic_q${i}"]:checked`).val());
            }
            // 問15のサブ質問（a～f）
            for (let c = 'a'.charCodeAt(0); c <= 'f'.charCodeAt(0); c++) {
                const letter = String.fromCharCode(c);
                bowelAnswers.push($(`input[name="epic_q15${letter}"]:checked`).val());
            }
            // 問16
            bowelAnswers.push($(`input[name="epic_q16"]:checked`).val());
            
            // 性機能（問17～問25）
            const sexualAnswers = [];
            // 問17のサブ質問（a～c）
            for (let c = 'a'.charCodeAt(0); c <= 'c'.charCodeAt(0); c++) {
                const letter = String.fromCharCode(c);
                sexualAnswers.push($(`input[name="epic_q17${letter}"]:checked`).val());
            }
            // 問18～問23
            for (let i = 18; i <= 23; i++) {
                sexualAnswers.push($(`input[name="epic_q${i}"]:checked`).val());
            }
            // 問24のサブ質問（a～c）
            for (let c = 'a'.charCodeAt(0); c <= 'c'.charCodeAt(0); c++) {
                const letter = String.fromCharCode(c);
                sexualAnswers.push($(`input[name="epic_q24${letter}"]:checked`).val());
            }
            // 問25
            sexualAnswers.push($(`input[name="epic_q25"]:checked`).val());
            
            // ホルモン機能（問26～問31）
            const hormoneAnswers = [];
            // 問26～問30
            for (let i = 26; i <= 30; i++) {
                hormoneAnswers.push($(`input[name="epic_q${i}"]:checked`).val());
            }
            // 問31のサブ質問（a～f）
            for (let c = 'a'.charCodeAt(0); c <= 'f'.charCodeAt(0); c++) {
                const letter = String.fromCharCode(c);
                hormoneAnswers.push($(`input[name="epic_q31${letter}"]:checked`).val());
            }
            
            // 全体的な満足度（問32）
            const satisfactionAnswer = $(`input[name="epic_q32"]:checked`).val();

        const today = new Date();
        const dateString = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;

            // QRコード用データを作成
            let qrData = `文書コード：991003\n入力日：${dateString}\n`;
            qrData += `排尿の状態: ${urinaryAnswers.join('-')}\n`;
            qrData += `排便とおなかの状態: ${bowelAnswers.join('-')}\n`;
            qrData += `性機能: ${sexualAnswers.join('-')}\n`;
            qrData += `ホルモン機能: ${hormoneAnswers.join('-')}\n`;
            qrData += `全体的な満足度: ${satisfactionAnswer}\n`;
            
            // 複数フォームが選択されている場合
            if (selectedForms.length > 1) {
                // 結果を保存
                formResults['epic'] = qrData;
                
                // 次のフォームに進む
                goToNextForm();
            } else {
                // 単一フォームの場合は従来通りの処理
                if (!$('#epic-result').length) {
                    $('#epicForm').append(`
                        <div id="epic-result" class="result-container">
                            <h3>結果</h3>
                            <div id="epic-qrcode"></div>
                            <div id="epic-qrtext"></div>
                            <div id="epic-maillink"></div>
                        </div>
                    `);
                }
                
        const encodedData = Encoding.convert(qrData, { to: 'SJIS', type: 'string' });

                // QRコード表示
                $('#epic-qrcode').html('').qrcode({
                    width: 256,
                    height: 256,
                    text: encodedData
                });
                $('#epic-qrtext').html(qrData.replace(/\n/g, '<br>'));
        
        // メールリンクを追加
        const mailBody = encodeURIComponent(qrData);
                const mailLink = `<a href="mailto:example@example.com?subject=EPIC評価結果&body=${mailBody}" class="mail-link">メールで送信</a>`;
                $('#epic-maillink').html(mailLink);
                
                // 結果表示エリアを表示
                $('#epic-result').show();
                
                // ページの一番下までスクロール
                $('html, body').animate({ scrollTop: $(document).height() }, 'slow');
            }
            return;
        }
        
        // 次のページに進む
        if (epicCurrentPage < epicTotalPages) {
            $(`#epicPage${epicCurrentPage}`).hide();
            epicCurrentPage++;
            $(`#epicPage${epicCurrentPage}`).show();
            $('#epicCurrentPage').text(epicCurrentPage);
            updateEpicNavButtons();
            
            // ページの先頭にスクロール
            window.scrollTo(0, 0);
        }
    });

    // EPICフォームの「戻る」ボタン
    $('.epic-prev-btn').click(function() {
        // 最初のページで「戻る」ボタンが押された場合
        if (epicCurrentPage === 1) {
            // 複数フォームが選択されている場合
            if (selectedForms.length > 1 && currentFormIndex > 0) {
                // 前のフォームに戻る
                currentFormIndex--;
                
                // 進行状況を更新
                $('#currentFormIndex').text(currentFormIndex + 1);
                $('#progressBar').css('width', `${((currentFormIndex + 1) / selectedForms.length) * 100}%`);
                
                // 前のフォームを表示
                showCurrentForm();
            } else {
                // 単一フォームの場合または最初のフォームの場合は何もしない
                return;
            }
        } else {
            // 2ページ目以降の場合は通常の戻る処理
            $(`#epicPage${epicCurrentPage}`).hide();
            epicCurrentPage--;
            $(`#epicPage${epicCurrentPage}`).show();
            $('#epicCurrentPage').text(epicCurrentPage);
            updateEpicNavButtons();
            
            // ページの先頭にスクロール
            window.scrollTo(0, 0);
        }
    });

    // フォームのバリデーションを行う関数
    function validateForm(formType) {
        switch (formType) {
            case 'ipss':
                return validateIpssForm();
            case 'ctcae':
                return validateCtcaeForm();
            case 'epic':
                return validateEpicForm();
            case 'eq5d':
                return validateEq5dForm();
            default:
                return true;
        }
    }

    // IPSSフォームのバリデーション
    function validateIpssForm() {
        const ipssScores = [
            parseInt($('input[name="ipssQuestion1"]:checked').val() || NaN),
            parseInt($('input[name="ipssQuestion2"]:checked').val() || NaN),
            parseInt($('input[name="ipssQuestion3"]:checked').val() || NaN),
            parseInt($('input[name="ipssQuestion4"]:checked').val() || NaN),
            parseInt($('input[name="ipssQuestion5"]:checked').val() || NaN),
            parseInt($('input[name="ipssQuestion6"]:checked').val() || NaN),
            parseInt($('input[name="ipssQuestion7"]:checked').val() || NaN)
        ];

        const qolScore = parseInt($('input[name="qolQuestion"]:checked').val() || NaN);

        if (ipssScores.includes(NaN) || isNaN(qolScore)) {
            alert('全ての項目を入力してください。');
            return false;
        }
        
        return true;
    }

    // CTCAEフォームのバリデーション
    function validateCtcaeForm() {
        const ctcaeItems = {
            'enteritis': $('#enteritis').val(),
            'rectalUlcer': $('#rectalUlcer').val(),
            'lowerGIHemorrhage': $('#lowerGIHemorrhage').val(),
            'analPain': $('#analPain').val(),
            'fecalIncontinence': $('#fecalIncontinence').val(),
            'ileus': $('#ileus').val(),
            'cystitisNoninfective': $('#cystitisNoninfective').val(),
            'urinaryRetention': $('#urinaryRetention').val(),
            'hematuria': $('#hematuria').val(),
            'urinaryTractPain': $('#urinaryTractPain').val(),
            'urinaryIncontinence': $('#urinaryIncontinence').val(),
            'fatigue': $('#fatigue').val(),
            'dermatitisRadiation': $('#dermatitisRadiation').val()
        };

        // 選択された項目があるか確認
        let hasSelection = false;
        for (const key in ctcaeItems) {
            if (ctcaeItems[key] !== "" && ctcaeItems[key] !== null) {
                hasSelection = true;
                break;
            }
        }

        if (!hasSelection) {
            alert('少なくとも1つの項目を評価してください。');
            return false;
        }
        
        return true;
    }

    // EPICフォームのバリデーション
    function validateEpicForm() {
        // 現在表示されているページの必須項目をチェック
        const currentPageInputs = $('.epic-page:visible').find('input[type="radio"]:required');
        const currentPageQuestions = {};
        
        currentPageInputs.each(function() {
            const name = $(this).attr('name');
            currentPageQuestions[name] = true;
        });
        
        let allAnswered = true;
        for (const question in currentPageQuestions) {
            if (!$(`input[name="${question}"]:checked`).val()) {
                allAnswered = false;
                break;
            }
        }
        
        if (!allAnswered) {
            alert('全ての質問に回答してください。');
            return false;
        }
        
        return true;
    }

    // EQ-5Dフォームのバリデーション
    function validateEq5dForm() {
        const eq5dValues = {
            mobility: $('input[name="eq5d_mobility"]:checked').val(),
            selfcare: $('input[name="eq5d_selfcare"]:checked').val(),
            activities: $('input[name="eq5d_activities"]:checked').val(),
            pain: $('input[name="eq5d_pain"]:checked').val(),
            anxiety: $('input[name="eq5d_anxiety"]:checked').val(),
            vas: $('#eq5d_vas').val()
        };

        // 全ての項目が入力されているか確認
        for (const key in eq5dValues) {
            if (!eq5dValues[key]) {
                alert('全ての項目を入力してください。');
                return false;
            }
        }
        
        // スライダーの値が初期値（空または「選択してください」の状態）かどうかを確認
        if (eq5dValues.vas === '' || $('#eq5d_vas_value').text() === '選択してください') {
            alert('健康状態のスライダーを動かして値を選択してください。');
            return false;
        }
        
        return true;
    }

    // フォームの結果を保存する関数
    function saveFormResult(formType) {
        const today = new Date();
        const dateString = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;
        
        let qrData = '';
        
        switch (formType) {
            case 'ipss':
                // IPSSフォームの結果を保存
                const ipssScores = [
                    parseInt($('input[name="ipssQuestion1"]:checked').val()),
                    parseInt($('input[name="ipssQuestion2"]:checked').val()),
                    parseInt($('input[name="ipssQuestion3"]:checked').val()),
                    parseInt($('input[name="ipssQuestion4"]:checked').val()),
                    parseInt($('input[name="ipssQuestion5"]:checked').val()),
                    parseInt($('input[name="ipssQuestion6"]:checked').val()),
                    parseInt($('input[name="ipssQuestion7"]:checked').val())
                ];
                const qolScore = parseInt($('input[name="qolQuestion"]:checked').val());
                const ipssTotal = ipssScores.reduce((a, b) => a + b, 0);
                const ipssQolTotal = ipssTotal + qolScore;
                const allScores = [...ipssScores, qolScore];
                const ipssQolScoresText = `IPSS-QOL：${allScores.join('-')}`;
                
                qrData = `文書コード：991001\n入力日：${dateString}\n${ipssQolScoresText}\nIPSS-QOL合計点：${ipssQolTotal}点\n`;
                break;
                
            case 'ctcae':
                // CTCAEフォームの結果を保存
                const ctcaeItems = {
                    'enteritis': $('#enteritis').val(),
                    'rectalUlcer': $('#rectalUlcer').val(),
                    'lowerGIHemorrhage': $('#lowerGIHemorrhage').val(),
                    'analPain': $('#analPain').val(),
                    'fecalIncontinence': $('#fecalIncontinence').val(),
                    'ileus': $('#ileus').val(),
                    'cystitisNoninfective': $('#cystitisNoninfective').val(),
                    'urinaryRetention': $('#urinaryRetention').val(),
                    'hematuria': $('#hematuria').val(),
                    'urinaryTractPain': $('#urinaryTractPain').val(),
                    'urinaryIncontinence': $('#urinaryIncontinence').val(),
                    'fatigue': $('#fatigue').val(),
                    'dermatitisRadiation': $('#dermatitisRadiation').val()
                };
                
                const itemNames = {
                    'enteritis': '腸炎',
                    'rectalUlcer': '直腸潰瘍',
                    'lowerGIHemorrhage': '下部消化管出血',
                    'analPain': '肛門痛',
                    'fecalIncontinence': '便失禁',
                    'ileus': 'イレウス',
                    'cystitisNoninfective': '非感染性膀胱炎',
                    'urinaryRetention': '尿閉',
                    'hematuria': '血尿',
                    'urinaryTractPain': '尿路痛',
                    'urinaryIncontinence': '尿失禁',
                    'fatigue': '倦怠感',
                    'dermatitisRadiation': '放射線皮膚炎'
                };
                
                qrData = `文書コード：991002\n入力日：${dateString}\n`;
                
                for (const key in ctcaeItems) {
                    if (ctcaeItems[key] !== "" && ctcaeItems[key] !== null && ctcaeItems[key] !== "0") {
                        const grade = ctcaeItems[key];
                        const itemText = `${itemNames[key]}：Grade ${grade}`;
                        qrData += `${itemText}\n`;
                    }
                }
                break;
                
            case 'epic':
                // EPICフォームの結果を保存
                // 排尿の状態（問1～問7）
                const urinaryAnswers = [];
                for (let i = 1; i <= 5; i++) {
                    urinaryAnswers.push($(`input[name="epic_q${i}"]:checked`).val());
                }
                // 問6のサブ質問（a～f）
                for (let c = 'a'.charCodeAt(0); c <= 'f'.charCodeAt(0); c++) {
                    const letter = String.fromCharCode(c);
                    urinaryAnswers.push($(`input[name="epic_q6${letter}"]:checked`).val());
                }
                // 問7
                urinaryAnswers.push($(`input[name="epic_q7"]:checked`).val());
                
                // 排便とおなかの状態（問8～問16）
                const bowelAnswers = [];
                for (let i = 8; i <= 14; i++) {
                    bowelAnswers.push($(`input[name="epic_q${i}"]:checked`).val());
                }
                // 問15のサブ質問（a～f）
                for (let c = 'a'.charCodeAt(0); c <= 'f'.charCodeAt(0); c++) {
                    const letter = String.fromCharCode(c);
                    bowelAnswers.push($(`input[name="epic_q15${letter}"]:checked`).val());
                }
                // 問16
                bowelAnswers.push($(`input[name="epic_q16"]:checked`).val());
                
                // 性機能（問17～問25）
                const sexualAnswers = [];
                // 問17のサブ質問（a～c）
                for (let c = 'a'.charCodeAt(0); c <= 'c'.charCodeAt(0); c++) {
                    const letter = String.fromCharCode(c);
                    sexualAnswers.push($(`input[name="epic_q17${letter}"]:checked`).val());
                }
                // 問18～問23
                for (let i = 18; i <= 23; i++) {
                    sexualAnswers.push($(`input[name="epic_q${i}"]:checked`).val());
                }
                // 問24のサブ質問（a～c）
                for (let c = 'a'.charCodeAt(0); c <= 'c'.charCodeAt(0); c++) {
                    const letter = String.fromCharCode(c);
                    sexualAnswers.push($(`input[name="epic_q24${letter}"]:checked`).val());
                }
                // 問25
                sexualAnswers.push($(`input[name="epic_q25"]:checked`).val());
                
                // ホルモン機能（問26～問31）
                const hormoneAnswers = [];
                // 問26～問30
                for (let i = 26; i <= 30; i++) {
                    hormoneAnswers.push($(`input[name="epic_q${i}"]:checked`).val());
                }
                // 問31のサブ質問（a～f）
                for (let c = 'a'.charCodeAt(0); c <= 'f'.charCodeAt(0); c++) {
                    const letter = String.fromCharCode(c);
                    hormoneAnswers.push($(`input[name="epic_q31${letter}"]:checked`).val());
                }
                
                // 全体的な満足度（問32）
                const satisfactionAnswer = $(`input[name="epic_q32"]:checked`).val();
                
                qrData = `文書コード：991003\n入力日：${dateString}\n`;
                qrData += `排尿の状態:${urinaryAnswers.join('-')}\n`;
                qrData += `排便とおなかの状態:${bowelAnswers.join('-')}\n`;
                qrData += `性機能:${sexualAnswers.join('-')}\n`;
                qrData += `ホルモン機能:${hormoneAnswers.join('-')}\n`;
                qrData += `全体的な満足度:${satisfactionAnswer}\n`;
                break;
                
            case 'eq5d':
                // EQ-5Dフォームの結果を保存
                const eq5dValues = {
                    mobility: $('input[name="eq5d_mobility"]:checked').val(),
                    selfcare: $('input[name="eq5d_selfcare"]:checked').val(),
                    activities: $('input[name="eq5d_activities"]:checked').val(),
                    pain: $('input[name="eq5d_pain"]:checked').val(),
                    anxiety: $('input[name="eq5d_anxiety"]:checked').val(),
                    vas: $('#eq5d_vas').val()
                };
                
                const eq5dScores = [
                    eq5dValues.mobility,
                    eq5dValues.selfcare,
                    eq5dValues.activities,
                    eq5dValues.pain,
                    eq5dValues.anxiety
                ];
                const eq5dScoresText = `EQ-5D：${eq5dScores.join('-')}`;
                
                qrData = `文書コード：991004\n入力日：${dateString}\n`;
                qrData += `${eq5dScoresText}\n`;
                qrData += `健康状態(VAS)：${eq5dValues.vas}/100\n`;
                break;
        }
        
        // 結果を保存
        formResults[formType] = qrData;
    }

    // 各フォームの確定ボタンのイベントを修正
    // IPSSフォームの確定ボタン処理
    $('#ipssConfirmButton').click(function() {
        // 必須項目のチェック
        if (validateIpssForm()) {
            // IPSSスコアの計算
            const ipssScores = [];
            let ipssTotal = 0;
            
            for (let i = 1; i <= 7; i++) {
                const score = parseInt($(`input[name="ipssQuestion${i}"]:checked`).val(), 10);
                ipssScores.push(score);
                ipssTotal += score;
            }
            
            // QOLスコア
            const qolScore = parseInt($('input[name="qolQuestion"]:checked').val(), 10);
            ipssScores.push(qolScore);
            
            // 現在の日付を取得
            const today = new Date();
            const dateString = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;
            
            // QRコード用データを作成
            let qrData = `【IPSS-QOLスコア】\n入力日：${dateString}\n`;
            qrData += `IPSS-QOL：${ipssScores.join('-')}\n`;
            qrData += `IPSS-QOL合計点：${ipssTotal}点\n`;
            
            // 複数フォームが選択されている場合
            if (selectedForms.length > 1) {
                // 結果を保存
                formResults['ipss'] = qrData;
                
                // 次のフォームに進む
                goToNextForm();
            } else {
                // 単一フォームの場合は従来通りの処理
                const encodedData = Encoding.convert(qrData, { to: 'SJIS', type: 'string' });
                
                // QRコード表示
                $('#ipss-qrcode').html('').qrcode({
                    width: 256,
                    height: 256,
                    text: encodedData
                });
                $('#ipss-qrtext').html(qrData.replace(/\n/g, '<br>'));
                
                // メールリンクを追加
                const mailBody = encodeURIComponent(qrData);
                const mailLink = `<a href="mailto:example@example.com?subject=IPSS-QOL結果&body=${mailBody}" class="mail-link">メールで送信</a>`;
                $('#ipss-maillink').html(mailLink);
                
                // 結果表示エリアを表示
                $('.ipss-result').show();
                
                // ページの一番下までスクロール
                $('html, body').animate({ scrollTop: $(document).height() }, 'slow');
            }
        }
    });

    // CTCAEフォームの確定ボタン処理
    $('#ctcaeConfirmButton').click(function() {
        // 必須項目のチェック
        if (validateCtcaeForm()) {
            // 選択された症状を収集
            const selectedSymptoms = [];
            
            $('.ctcae-select').each(function() {
                const symptomName = $(this).prev('label').text().replace(':', '');
                const gradeValue = $(this).val();
                
                if (gradeValue && gradeValue !== '0') {
                    selectedSymptoms.push({
                        name: symptomName,
                        grade: `Grade ${gradeValue}`
                    });
                }
            });
            
            // 現在の日付を取得
            const today = new Date();
            const dateString = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;
            
            // QRコード用データを作成
            let qrData = `【CTCAE（前立腺癌）】\n入力日：${dateString}\n`;
            
            // 選択された症状がある場合のみ追加
            if (selectedSymptoms.length > 0) {
                selectedSymptoms.forEach(symptom => {
                    qrData += `${symptom.name}：${symptom.grade}\n`;
                });
            } else {
                qrData += "該当する症状はありません\n";
            }
            
            // 複数フォームが選択されている場合
            if (selectedForms.length > 1) {
                // 結果を保存
                formResults['ctcae'] = qrData;
                
                // 次のフォームに進む
                goToNextForm();
            } else {
                // 単一フォームの場合は従来通りの処理
                const encodedData = Encoding.convert(qrData, { to: 'SJIS', type: 'string' });
                
                // QRコード表示
                $('#ctcae-qrcode').html('').qrcode({
                    width: 256,
                    height: 256,
                    text: encodedData
                });
                $('#ctcae-qrtext').html(qrData.replace(/\n/g, '<br>'));
                
                // メールリンクを追加
                const mailBody = encodeURIComponent(qrData);
                const mailLink = `<a href="mailto:example@example.com?subject=CTCAE（前立腺癌）結果&body=${mailBody}" class="mail-link">メールで送信</a>`;
                $('#ctcae-maillink').html(mailLink);
                
                // 結果表示エリアを表示
                $('.ctcae-result').show();
                
                // ページの一番下までスクロール
                $('html, body').animate({ scrollTop: $(document).height() }, 'slow');
            }
        }
    });

    // EPICフォームの結果保存
    function saveEpicResult() {
        // 全ての回答を収集
        // 排尿の状態（問1～問7）
        const urinaryAnswers = [];
        for (let i = 1; i <= 5; i++) {
            urinaryAnswers.push($(`input[name="epic_q${i}"]:checked`).val());
        }
        // 問6のサブ質問（a～f）
        for (let c = 'a'.charCodeAt(0); c <= 'f'.charCodeAt(0); c++) {
            const letter = String.fromCharCode(c);
            urinaryAnswers.push($(`input[name="epic_q6${letter}"]:checked`).val());
        }
        // 問7
        urinaryAnswers.push($(`input[name="epic_q7"]:checked`).val());
        
        // 排便とおなかの状態（問8～問16）
        const bowelAnswers = [];
        for (let i = 8; i <= 14; i++) {
            bowelAnswers.push($(`input[name="epic_q${i}"]:checked`).val());
        }
        // 問15のサブ質問（a～f）
        for (let c = 'a'.charCodeAt(0); c <= 'f'.charCodeAt(0); c++) {
            const letter = String.fromCharCode(c);
            bowelAnswers.push($(`input[name="epic_q15${letter}"]:checked`).val());
        }
        // 問16
        bowelAnswers.push($(`input[name="epic_q16"]:checked`).val());
        
        // 性機能（問17～問25）
        const sexualAnswers = [];
        // 問17のサブ質問（a～c）
        for (let c = 'a'.charCodeAt(0); c <= 'c'.charCodeAt(0); c++) {
            const letter = String.fromCharCode(c);
            sexualAnswers.push($(`input[name="epic_q17${letter}"]:checked`).val());
        }
        // 問18～問23
        for (let i = 18; i <= 23; i++) {
            sexualAnswers.push($(`input[name="epic_q${i}"]:checked`).val());
        }
        // 問24のサブ質問（a～c）
        for (let c = 'a'.charCodeAt(0); c <= 'c'.charCodeAt(0); c++) {
            const letter = String.fromCharCode(c);
            sexualAnswers.push($(`input[name="epic_q24${letter}"]:checked`).val());
        }
        // 問25
        sexualAnswers.push($(`input[name="epic_q25"]:checked`).val());
        
        // ホルモン機能（問26～問31）
        const hormoneAnswers = [];
        // 問26～問30
        for (let i = 26; i <= 30; i++) {
            hormoneAnswers.push($(`input[name="epic_q${i}"]:checked`).val());
        }
        // 問31のサブ質問（a～f）
        for (let c = 'a'.charCodeAt(0); c <= 'f'.charCodeAt(0); c++) {
            const letter = String.fromCharCode(c);
            hormoneAnswers.push($(`input[name="epic_q31${letter}"]:checked`).val());
        }
        
        // 全体的な満足度（問32）
        const satisfactionAnswer = $(`input[name="epic_q32"]:checked`).val();
        
        // 現在の日付を取得
        const today = new Date();
        const dateString = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;
        
        // QRコード用データを作成
        let qrData = `【EPIC（前立腺癌QOL）】\n入力日：${dateString}\n`;
        qrData += `排尿の状態:${urinaryAnswers.join('-')}\n`;
        qrData += `排便とおなかの状態:${bowelAnswers.join('-')}\n`;
        qrData += `性機能:${sexualAnswers.join('-')}\n`;
        qrData += `ホルモン機能:${hormoneAnswers.join('-')}\n`;
        qrData += `全体的な満足度:${satisfactionAnswer}\n`;
        
        return qrData;
    }

    // EQ-5Dフォームの確定ボタン処理
    $('#eq5dConfirmButton').click(function() {
        // 必須項目のチェック
        if (validateEq5dForm()) {
            // EQ-5Dの値を取得
            const eq5dValues = {
                mobility: $('input[name="eq5d_mobility"]:checked').val(),
                selfcare: $('input[name="eq5d_selfcare"]:checked').val(),
                activities: $('input[name="eq5d_activities"]:checked').val(),
                pain: $('input[name="eq5d_pain"]:checked').val(),
                anxiety: $('input[name="eq5d_anxiety"]:checked').val(),
                vas: $('#eq5d_vas').val()
            };
            
            // 現在の日付を取得
            const today = new Date();
            const dateString = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;
            
            // EQ-5Dスコアを配列に格納
            const eq5dScores = [
                eq5dValues.mobility,
                eq5dValues.selfcare,
                eq5dValues.activities,
                eq5dValues.pain,
                eq5dValues.anxiety
            ];
            
            // QRコード用データを作成
            let qrData = `【EQ-5D】\n入力日：${dateString}\n`;
            qrData += `EQ-5D：${eq5dScores.join('-')}\n`;
            qrData += `健康状態(VAS)：${eq5dValues.vas}/100\n`;
            
            // 複数フォームが選択されている場合
            if (selectedForms.length > 1) {
                // 結果を保存
                formResults['eq5d'] = qrData;
                
                // 次のフォームに進む
                goToNextForm();
            } else {
                // 単一フォームの場合は従来通りの処理
                const encodedData = Encoding.convert(qrData, { to: 'SJIS', type: 'string' });
                
                // QRコード表示
                $('#eq5d-qrcode').html('').qrcode({
                    width: 256,
                    height: 256,
                    text: encodedData
                });
                $('#eq5d-qrtext').html(qrData.replace(/\n/g, '<br>'));
                
                // メールリンクを追加
                const mailBody = encodeURIComponent(qrData);
                const mailLink = `<a href="mailto:example@example.com?subject=EQ-5D結果&body=${mailBody}" class="mail-link">メールで送信</a>`;
                $('#eq5d-maillink').html(mailLink);
                
                // 結果表示エリアを表示
                $('.eq5d-result').show();
                
                // ページの一番下までスクロール
                $('html, body').animate({ scrollTop: $(document).height() }, 'slow');
            }
        }
    });

    // 次のフォームに進む関数
    function goToNextForm() {
        currentFormIndex++;
        
        // 進行状況を更新
        $('#currentFormIndex').text(currentFormIndex + 1);
        $('#progressBar').css('width', `${((currentFormIndex + 1) / selectedForms.length) * 100}%`);
        
        if (currentFormIndex < selectedForms.length) {
            // 次のフォームを表示
            showCurrentForm();
            
            // ページの一番上にスクロール
            window.scrollTo(0, 0);
        } else {
            // すべてのフォームが完了した場合
            showFinalResults();
            
            // ページの一番上にスクロール
            window.scrollTo(0, 0);
        }
    }

    // 最終結果を表示する関数
    function showFinalResults() {
        // すべてのフォームを非表示
        $('.form-section').hide();
        $('.progress-indicator').hide();
        
        // タイトルを更新
        $('h1').text('回答完了');
        
        // 結果を結合
        const today = new Date();
        const dateString = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;
        
        let combinedQrData = `入力日：${dateString}\n`;
        
        // 各フォームの結果を追加
        for (const form in formResults) {
            // フォームデータから入力日を除去
            const formLines = formResults[form].split('\n');
            
            // 最初の行がタイトル行でない場合、タイトルを追加
            if (!formLines[0].startsWith('【')) {
                combinedQrData += `【${getFormTitle(form)}】\n`;
            } else {
                // タイトル行をそのまま追加
                combinedQrData += `${formLines[0]}\n`;
            }
            
            // 入力日の行をスキップして残りの行を追加
            for (let i = 1; i < formLines.length; i++) {
                if (!formLines[i].startsWith('入力日：')) {
                    combinedQrData += `${formLines[i]}\n`;
                }
            }
        }
        
        const encodedData = Encoding.convert(combinedQrData, { to: 'SJIS', type: 'string' });
        
        // QRコード表示
        $('#combined-qrcode').html('').qrcode({
            width: 256,
            height: 256,
            text: encodedData
        });
        $('#combined-qrtext').html(combinedQrData.replace(/\n/g, '<br>'));
        
        // メールリンクを追加
        const mailBody = encodeURIComponent(combinedQrData);
        const mailLink = `<a href="mailto:example@example.com?subject=問診結果&body=${mailBody}" class="mail-link">メールで送信</a>`;
        $('#combined-maillink').html(mailLink);
        
        // 最終結果を表示
        $('#final-results').show();
        
        // ページの一番上にスクロール
        window.scrollTo(0, 0);
    }

    // フォーム名から表示名を取得する関数
    function getFormTitle(form) {
        switch (form) {
            case 'ipss': return 'IPSS-QOLスコア';
            case 'ctcae': return 'CTCAE（前立腺癌）';
            case 'epic': return 'EPIC（前立腺癌QOL）';
            case 'eq5d': return 'EQ-5D';
            default: return '';
        }
    }

    // フォーム名から文書コードを取得する関数
    function getDocCode(form) {
        switch (form) {
            case 'ipss': return '991001';
            case 'ctcae': return '991002';
            case 'epic': return '991003';
            case 'eq5d': return '991004';
            default: return '999999';
        }
    }

    // VASスライダーの初期化と値の表示
    $('#eq5d_vas').val('');
    $('#eq5d_vas_value').text('選択してください');
    
    // スライダーの値が変更されたときの処理
    $('#eq5d_vas').on('input', function() {
        $('#eq5d_vas_value').text($(this).val());
    });

    function generateQRCode(data) {
        $('#qrcode').html('').qrcode({
            width: 256,
            height: 256,
            text: data
        });
    }

    // 現在のフォームを表示する関数
    function showCurrentForm() {
        // すべてのフォームを非表示
        $('.form-section').hide();
        
        // 現在のフォームを表示
        const currentForm = selectedForms[currentFormIndex];
        $(`#${currentForm}Form`).show();
        
        // タイトルを更新
        let titleText = 'スマート問診アプリ';
        if (currentForm === 'ipss') {
            titleText = 'IPSS-QOLスコア';
        } else if (currentForm === 'ctcae') {
            titleText = 'CTCAE（前立腺癌）';
        } else if (currentForm === 'epic') {
            titleText = 'EPIC（前立腺癌QOL）';
        } else if (currentForm === 'eq5d') {
            titleText = 'EQ-5D';
        }
        $('h1').text(titleText);
        
        // ナビゲーションボタンの表示を更新
        updateNavigationButtons();
        
        // ページの一番上にスクロール
        window.scrollTo(0, 0);
    }

    // 読み込みツールボタンのクリックイベント
    $('#importToolButton').click(function() {
        // 項目選択部分を非表示にする
        $('.item-selection').hide();
        
        // 読み込みツールフォームを表示
        $('#importToolForm').show();
        
        // タイトルを更新
        $('h1').text('読み込みツール');
        
        // ページの一番上にスクロール
        window.scrollTo(0, 0);
    });

    // 変換ボタンのクリックイベント
    $('#convertButton').click(function() {
        const inputData = $('#importData').val().trim();
        
        if (!inputData) {
            alert('データを入力してください。');
            return;
        }
        
        try {
            // 入力データを解析してCSVに変換
            const csvData = convertToCSV(inputData);
            
            // 結果を表示
            $('#csvOutput').val(csvData);
            $('#csvResult').show();
        } catch (error) {
            alert('データの解析に失敗しました。正しい形式のデータを入力してください。\nエラー: ' + error.message);
        }
    });

    // コピーボタンのクリックイベント
    $('#copyButton').click(function() {
        const csvOutput = document.getElementById('csvOutput');
        csvOutput.select();
        document.execCommand('copy');
        
        // コピー成功のフィードバック
        const originalText = $(this).text();
        $(this).text('コピーしました！');
        setTimeout(() => {
            $(this).text(originalText);
        }, 2000);
    });

    // 戻るボタンのクリックイベント
    $('#backButton').click(function() {
        // 読み込みツールフォームを非表示
        $('#importToolForm').hide();
        $('#csvResult').hide();
        
        // 項目選択部分を表示
        $('.item-selection').show();
        
        // タイトルを更新
        $('h1').text('スマート問診アプリ');
        
        // 入力フィールドをクリア
        $('#importData').val('');
        $('#csvOutput').val('');
        
        // ページの一番上にスクロール
        window.scrollTo(0, 0);
    });

    // 入力データをCSVに変換する関数
    function convertToCSV(inputData) {
        // 入力データを行ごとに分割
        const lines = inputData.split('\n');
        
        // 入力日を取得
        let inputDate = '';
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('入力日：')) {
                inputDate = lines[i].replace('入力日：', '').trim();
                break;
            }
        }
        
        // 各フォームのデータを抽出
        const formData = {};
        let currentForm = '';
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // フォームのタイトル行を検出
            if (line.startsWith('【') && line.endsWith('】')) {
                currentForm = line.substring(1, line.length - 1);
                formData[currentForm] = { 
                    scores: [], 
                    items: [],
                    urinaryScores: [],
                    bowelScores: [],
                    sexualScores: [],
                    hormoneScores: [],
                    satisfactionScore: null
                };
                continue;
            }
            
            // 各フォームのスコアデータを抽出（コロンの後のスペースの有無に対応）
            if (currentForm && (line.includes('：') || line.includes(':'))) {
                // コロンで分割（全角コロンと半角コロンの両方に対応）
                const parts = line.split(/[：:]/);
                const key = parts[0].trim();
                let value = parts[1].trim();
                
                if (key === 'IPSS-QOL') {
                    formData[currentForm].scores = value.split('-').map(v => parseInt(v, 10));
                } else if (key === 'EQ-5D') {
                    formData[currentForm].scores = value.split('-').map(v => parseInt(v, 10));
                } else if (key === '排尿の状態') {
                    formData[currentForm].urinaryScores = value.split('-').map(v => parseInt(v, 10));
                } else if (key === '排便とおなかの状態') {
                    formData[currentForm].bowelScores = value.split('-').map(v => parseInt(v, 10));
                } else if (key === '性機能') {
                    formData[currentForm].sexualScores = value.split('-').map(v => parseInt(v, 10));
                } else if (key === 'ホルモン機能') {
                    formData[currentForm].hormoneScores = value.split('-').map(v => parseInt(v, 10));
                } else if (key === '全体的な満足度') {
                    formData[currentForm].satisfactionScore = parseInt(value, 10);
                } else if (key === '健康状態(VAS)') {
                    // EQ-5Dの場合、VAS値を抽出
                    const vasValue = parseInt(value.split('/')[0], 10);
                    if (!isNaN(vasValue)) {
                        formData[currentForm].scores.push(vasValue);
                    }
                } else if (key !== '文書コード' && key !== 'IPSS-QOL合計点') {
                    // CTCAEの項目を抽出
                    const gradeMatch = value.match(/Grade (\d+)/);
                    if (gradeMatch) {
                        const grade = Number(gradeMatch[1]);
                        formData[currentForm].items.push({ name: key, grade });
                    }
                }
            }
        }
        
        // デバッグ用：EPICデータの確認
        console.log("EPIC Data:", formData['EPIC（前立腺癌QOL）']);
        
        // CSVデータを生成
        let csvRows = [];
        
        // IPSSのCSV生成
        if (formData['IPSS-QOLスコア']) {
            const ipssHeaders = ['入力日', '残尿感', '頻尿', '尿線途絶', '尿意切迫感', '尿勢低下', '腹圧排尿', '夜間頻尿', 'QOL'];
            
            csvRows.push(['IPSS-QOLスコア']);
            csvRows.push([...ipssHeaders]);
            csvRows.push([inputDate, ...formData['IPSS-QOLスコア'].scores]);
            csvRows.push([]);  // 空行を追加
        }
        
        // CTCAEのCSV生成
        if (formData['CTCAE（前立腺癌）']) {
            const ctcaeItems = formData['CTCAE（前立腺癌）'].items;
            if (ctcaeItems.length > 0) {
                csvRows.push(['CTCAE（前立腺癌）']);
                csvRows.push(['入力日', ...ctcaeItems.map(item => item.name)]);
                csvRows.push(['', ...ctcaeItems.map(() => 'Grade')]);
                csvRows.push([inputDate, ...ctcaeItems.map(item => item.grade)]);
                csvRows.push([]);  // 空行を追加
            }
        }
        
        // EPICのCSV生成
        if (formData['EPIC（前立腺癌QOL）']) {
            const epicData = formData['EPIC（前立腺癌QOL）'];
            
            // EPIC全体のデータを表示
            csvRows.push(['EPIC（前立腺癌QOL）']);
            
            // すべてのヘッダーを結合
            const allHeaders = ['入力日'];
            
            // 排尿の状態（問1～問7）のヘッダー
            if (epicData.urinaryScores && epicData.urinaryScores.length > 0) {
                for (let i = 1; i <= 5; i++) {
                    allHeaders.push(`排尿Q${i}`);
                }
                for (let c = 'a'.charCodeAt(0); c <= 'f'.charCodeAt(0); c++) {
                    const letter = String.fromCharCode(c);
                    allHeaders.push(`排尿Q6${letter}`);
                }
                allHeaders.push('排尿Q7');
            }
            
            // 排便とおなかの状態（問8～問16）のヘッダー
            if (epicData.bowelScores && epicData.bowelScores.length > 0) {
                for (let i = 8; i <= 14; i++) {
                    allHeaders.push(`排便Q${i}`);
                }
                for (let c = 'a'.charCodeAt(0); c <= 'f'.charCodeAt(0); c++) {
                    const letter = String.fromCharCode(c);
                    allHeaders.push(`排便Q15${letter}`);
                }
                allHeaders.push('排便Q16');
            }
            
            // 性機能（問17～問25）のヘッダー
            if (epicData.sexualScores && epicData.sexualScores.length > 0) {
                for (let c = 'a'.charCodeAt(0); c <= 'c'.charCodeAt(0); c++) {
                    const letter = String.fromCharCode(c);
                    allHeaders.push(`性機能Q17${letter}`);
                }
                for (let i = 18; i <= 23; i++) {
                    allHeaders.push(`性機能Q${i}`);
                }
                for (let c = 'a'.charCodeAt(0); c <= 'c'.charCodeAt(0); c++) {
                    const letter = String.fromCharCode(c);
                    allHeaders.push(`性機能Q24${letter}`);
                }
                allHeaders.push('性機能Q25');
            }
            
            // ホルモン機能（問26～問31）のヘッダー
            if (epicData.hormoneScores && epicData.hormoneScores.length > 0) {
                for (let i = 26; i <= 30; i++) {
                    allHeaders.push(`ホルモンQ${i}`);
                }
                for (let c = 'a'.charCodeAt(0); c <= 'f'.charCodeAt(0); c++) {
                    const letter = String.fromCharCode(c);
                    allHeaders.push(`ホルモンQ31${letter}`);
                }
            }
            
            // 全体的な満足度のヘッダー
            if (epicData.satisfactionScore !== null) {
                allHeaders.push('満足度Q32');
            }
            
            // ヘッダー行を追加
            csvRows.push(allHeaders);
            
            // すべての値を結合
            const allValues = [inputDate];
            
            // 排尿の状態の値
            if (epicData.urinaryScores && epicData.urinaryScores.length > 0) {
                allValues.push(...epicData.urinaryScores);
            }
            
            // 排便とおなかの状態の値
            if (epicData.bowelScores && epicData.bowelScores.length > 0) {
                allValues.push(...epicData.bowelScores);
            }
            
            // 性機能の値
            if (epicData.sexualScores && epicData.sexualScores.length > 0) {
                allValues.push(...epicData.sexualScores);
            }
            
            // ホルモン機能の値
            if (epicData.hormoneScores && epicData.hormoneScores.length > 0) {
                allValues.push(...epicData.hormoneScores);
            }
            
            // 全体的な満足度の値
            if (epicData.satisfactionScore !== null) {
                allValues.push(epicData.satisfactionScore);
            }
            
            // 値の行を追加
            csvRows.push(allValues);
            csvRows.push([]);  // 空行を追加
        }
        
        // EQ-5DのCSV生成
        if (formData['EQ-5D']) {
            const eq5dHeaders = ['入力日', '移動の程度', '身の回りの管理', 'ふだんの活動', '痛み/不快感', '不安/ふさぎ込み', '健康状態(VAS)'];
            
            csvRows.push(['EQ-5D']);
            csvRows.push([...eq5dHeaders]);
            csvRows.push([inputDate, ...formData['EQ-5D'].scores]);
        }
        
        // 配列をタブ区切りのCSV文字列に変換
        return csvRows.map(row => row.join('\t')).join('\n');
    }
});
