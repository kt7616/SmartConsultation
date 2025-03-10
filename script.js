$(document).ready(function() {
    window.scrollTo(0, 0);

    // メール送信ボタンのクリックイベントを削除

    // フォームに入力があったかどうかのフラグ
    let hasUserInput = false;
    
    // IPSSとEQ-5Dの質問と選択肢を定義
    const questions = {
        ipss: [
            {
                id: 1,
                text: "この1ヶ月間で、尿が出終わった後に尿がまだ残っている感じがありましたか？",
                options: ["全くない", "5回に1回以下", "2回に1回くらい", "2回に1回より多い", "ほとんどいつも"]
            },
            {
                id: 2,
                text: "この1ヶ月間で、尿をし始めてから2時間以内にもう一度しなければならないことがありましたか？",
                options: ["全くない", "5回に1回以下", "2回に1回くらい", "2回に1回より多い", "ほとんどいつも"]
            },
            {
                id: 3,
                text: "この1ヶ月間で、尿をしている途中で尿が途切れることがありましたか？",
                options: ["全くない", "5回に1回以下", "2回に1回くらい", "2回に1回より多い", "ほとんどいつも"]
            },
            {
                id: 4,
                text: "この1ヶ月間で、尿を我慢するのが難しいことがありましたか？",
                options: ["全くない", "5回に1回以下", "2回に1回くらい", "2回に1回より多い", "ほとんどいつも"]
            },
            {
                id: 5,
                text: "この1ヶ月間で、尿の勢いが弱いことがありましたか？",
                options: ["全くない", "5回に1回以下", "2回に1回くらい", "2回に1回より多い", "ほとんどいつも"]
            },
            {
                id: 6,
                text: "この1ヶ月間で、尿をし始めるためにいきむ必要がありましたか？",
                options: ["全くない", "5回に1回以下", "2回に1回くらい", "2回に1回より多い", "ほとんどいつも"]
            },
            {
                id: 7,
                text: "この1ヶ月間で、夜寝てから朝起きるまでに何回尿をするために起きましたか？",
                options: ["0回", "1回", "2回", "3回", "4回", "5回以上"]
            },
            {
                id: 8,
                text: "現在の排尿状態が今後ずっと続くとしたら、あなたはどう感じますか？",
                options: ["とても満足", "満足", "やや満足", "どちらでもない", "やや不満", "不満", "とても不満"]
            }
        ],
        eq5d: [
            {
                id: 101,
                text: "移動の程度について、あなたの状態を最もよく表している記述を選んでください。",
                options: ["私は歩き回るのに問題はない", "私は歩き回るのにいくらか問題がある", "私は歩き回るのに中程度の問題がある", "私は歩き回るのに重度の問題がある", "私は歩き回ることができない"]
            },
            {
                id: 102,
                text: "身の回りの管理について、あなたの状態を最もよく表している記述を選んでください。",
                options: ["私は自分で身の回りの管理をするのに問題はない", "私は自分で身の回りの管理をするのにいくらか問題がある", "私は自分で身の回りの管理をするのに中程度の問題がある", "私は自分で身の回りの管理をするのに重度の問題がある", "私は自分で身の回りの管理をすることができない"]
            },
            {
                id: 103,
                text: "普段の活動（仕事、勉強、家事、家族、余暇活動）について、あなたの状態を最もよく表している記述を選んでください。",
                options: ["私は普段の活動を行うのに問題はない", "私は普段の活動を行うのにいくらか問題がある", "私は普段の活動を行うのに中程度の問題がある", "私は普段の活動を行うのに重度の問題がある", "私は普段の活動を行うことができない"]
            },
            {
                id: 104,
                text: "痛み／不快感について、あなたの状態を最もよく表している記述を選んでください。",
                options: ["私は痛みや不快感はない", "私はいくらかの痛みや不快感がある", "私は中程度の痛みや不快感がある", "私は重度の痛みや不快感がある", "私は極度の痛みや不快感がある"]
            },
            {
                id: 105,
                text: "不安／ふさぎ込みについて、あなたの状態を最もよく表している記述を選んでください。",
                options: ["私は不安でもふさぎ込んでもいない", "私はいくらか不安またはふさぎ込んでいる", "私は中程度に不安またはふさぎ込んでいる", "私は重度に不安またはふさぎ込んでいる", "私は極度に不安またはふさぎ込んでいる"]
            },
            {
                id: 106,
                text: "あなたの今日の健康状態がどのくらい良いか悪いかを0～100で教えてください。\n（100はあなたの想像できる最も良い健康状態を、0はあなたの想像できる最も悪い健康状態を表しています。）",
                type: "vas",
                min: 0,
                max: 100
            }
        ]
    };
    
    let currentFormType = "";
    let currentQuestionIndex = 0;
    let answers = {
        ipss: new Array(questions.ipss.length).fill(null),
        eq5d: new Array(questions.eq5d.length).fill(null)
    };
    
    // 開始ボタンのイベントリスナー
    $('#startButton').on('click', function() {
        // 開始画面を非表示
        $('#startScreen').hide();
        // チャットインターフェースを表示
        $('#chatInterface').show();
        
        // 固定で回答する項目を設定（IPSS-QOLとEQ-5D）
        const selectedForms = ['ipss', 'eq5d'];
        
        if (selectedForms.length > 0) {
            currentFormType = selectedForms[0];
            
            // 複数のメッセージを遅延を入れて表示
            addBotMessages([
                "それでは質問を開始します。",
                "前半では排尿関連の症状についてお聞きします。"
            ]);
            
            // 最初の質問を表示（最後のメッセージから十分な時間をあけて）
            setTimeout(() => {
                showQuestion(currentQuestionIndex);
            }, 1200);
        }
    });
    
    // スクロール処理を行う関数
    function scrollToLatestContent(target = null, offset = 100) {
        const messagesDiv = document.getElementById('chatMessages');
        
        // チャットエリア内のスクロール
        const scrollHeight = messagesDiv.scrollHeight;
        $(messagesDiv).animate({ scrollTop: scrollHeight }, 400);
        
        // ターゲット要素が指定されている場合はその要素までスクロール
        if (target) {
            const targetPosition = $(target).offset().top;
            const viewportHeight = window.innerHeight;
            const currentScroll = window.pageYOffset;
            
            // ターゲットが表示領域外にある場合のみスクロール
            if (targetPosition > currentScroll + viewportHeight - offset || 
                targetPosition < currentScroll + offset) {
                $('html, body').animate({
                    scrollTop: targetPosition - (viewportHeight / 3)
                }, 400);
            }
        }
    }
    
    // メッセージを追加する関数
    function addMessage(text, isUser = false) {
        const messagesDiv = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = text;
        
        messageDiv.appendChild(contentDiv);
        messagesDiv.appendChild(messageDiv);
        
        // スムーズなスクロール（メッセージの追加後）
        setTimeout(() => {
            scrollToLatestContent(messageDiv);
        }, 100);
        
        return messageDiv; // 追加したメッセージ要素を返す
    }
    
    // 複数のBOTメッセージを遅延を入れて順番に表示する関数
    function addBotMessages(messages, currentIndex = 0, delay = 600) {
        if (currentIndex >= messages.length) return;
        
        // 現在のメッセージを表示
        addMessage(messages[currentIndex], false);
        
        // 次のメッセージを遅延を入れて表示
        if (currentIndex < messages.length - 1) {
            setTimeout(() => {
                addBotMessages(messages, currentIndex + 1, delay);
            }, delay);
        }
    }
    
    // 質問を表示する関数
    function showQuestion(index) {
        if (index >= questions[currentFormType].length) {
            handleFormCompletion();
            return;
        }

        const question = questions[currentFormType][index];
        const messageDiv = addMessage(question.text, false);
        messageDiv.setAttribute('data-question-index', index);
        messageDiv.setAttribute('data-form-type', currentFormType);
        
        // 質問を表示してから選択肢を表示するまでに遅延を入れる
        setTimeout(() => {
            // 質問タイプに応じて表示を変更
            if (question.type === 'vas') {
                // VASスライダーを表示
                const vasContainer = document.createElement('div');
                vasContainer.className = 'vas-container';
                
                const slider = document.createElement('input');
                slider.type = 'range';
                slider.min = question.min;
                slider.max = question.max;
                slider.value = answers[currentFormType][index] || '';
                slider.className = 'vas-slider';
                
                const valueDisplay = document.createElement('div');
                valueDisplay.className = 'vas-value';
                valueDisplay.innerHTML = `<span id="vas_value">${answers[currentFormType][index] || '選択してください'}</span>/${question.max}`;
                
                // スライダーの値が変更されたときの処理
                slider.oninput = function() {
                    valueDisplay.innerHTML = `<span id="vas_value">${this.value}</span>/${question.max}`;
                    answers[currentFormType][index] = this.value;
                };
                
                // 確定ボタン
                const confirmButton = document.createElement('button');
                confirmButton.className = 'option-button vas-confirm';
                confirmButton.textContent = '確定';
                confirmButton.onclick = function() {
                    if (answers[currentFormType][index]) {
                        // ボタンにconfirmedクラスを追加してブルーのままにする
                        confirmButton.classList.add('confirmed');
                        
                        // 次の質問へ進む
                        currentQuestionIndex++;
                        
                        setTimeout(() => {
                            if (currentQuestionIndex < questions[currentFormType].length) {
                                showQuestion(currentQuestionIndex);
                            } else {
                                handleFormCompletion();
                            }
                        }, 600);
                    } else {
                        // 値が選択されていない場合は警告
                        alert('値を選択してください');
                    }
                };
                
                vasContainer.appendChild(slider);
                vasContainer.appendChild(valueDisplay);
                vasContainer.appendChild(confirmButton);
                messageDiv.appendChild(vasContainer);
            } else {
                // 通常の選択肢を表示
                const optionsDiv = document.createElement('div');
                optionsDiv.className = 'options';
                optionsDiv.setAttribute('data-question-id', question.id);
                
                question.options.forEach((option, optionIndex) => {
                    const button = document.createElement('button');
                    button.className = 'option-button';
                    
                    // もし既に回答済みならselectedクラスを追加
                    if (answers[currentFormType][index] === option) {
                        button.classList.add('selected');
                    }
                    
                    button.textContent = option;
                    button.setAttribute('data-question-index', index);
                    button.setAttribute('data-option-index', optionIndex);
                    button.setAttribute('data-form-type', currentFormType);
                    button.onclick = function() {
                        handleOptionClick(this, index, option);
                    };
                    
                    optionsDiv.appendChild(button);
                });
                
                messageDiv.appendChild(optionsDiv);
            }
            
            // 質問と選択肢が表示された後にスクロール
            setTimeout(() => {
                scrollToLatestContent(messageDiv.lastChild);
            }, 200);
        }, 600); // 質問を表示してから選択肢を表示するまでの遅延
    }
    
    // 選択肢クリック時の処理
    function handleOptionClick(buttonElement, questionIndex, selectedOption) {
        const formType = buttonElement.getAttribute('data-form-type');
        const currentOptions = document.querySelectorAll(`.options[data-question-id="${questions[formType][questionIndex].id}"] .option-button`);
        
        // 同じ質問の全ての選択肢からselectedクラスを削除
        currentOptions.forEach(button => {
            button.classList.remove('selected');
            button.classList.remove('animated-select');
        });
        
        // クリックされた選択肢にselectedクラスを追加
        buttonElement.classList.add('selected');
        
        // 回答を保存
        answers[formType][questionIndex] = selectedOption;
        
        // 色の変化だけで選択を示す
        $(buttonElement).addClass('animated-select');
        
        // 選択肢が画面の下部にある場合は選択した選択肢が見えるようにスクロール
        scrollToLatestContent(buttonElement, 150);
        
        // 過去の質問の回答を変更した場合
        if (formType === currentFormType && questionIndex !== currentQuestionIndex) {
            handlePastAnswerChange(formType, questionIndex);
            return;
        }
        
        // 現在の質問の場合、次の質問へ進む
        if (formType === currentFormType && questionIndex === currentQuestionIndex) {
            // 次の質問のインデックスを設定
            currentQuestionIndex++;
            
            // 少し遅延させて次の質問を表示
            setTimeout(() => {
                if (currentQuestionIndex < questions[currentFormType].length) {
                    showQuestion(currentQuestionIndex);
                } else {
                    handleFormCompletion();
                }
            }, 600); // 遅延を少し長くして選択のアニメーションを見せる
        }
    }
    
    // 過去の回答変更時の処理
    function handlePastAnswerChange(formType, questionIndex) {
        // 回答内容の更新のみを行う
        const selectedOption = answers[formType][questionIndex];
        
        // 選択された回答を視覚的に反映
        const currentOptions = document.querySelectorAll(`.options[data-question-id="${questions[formType][questionIndex].id}"] .option-button`);
        currentOptions.forEach(button => {
            if (button.textContent === selectedOption) {
                button.classList.add('selected', 'animated-select');
            } else {
                button.classList.remove('selected');
                button.classList.remove('animated-select');
            }
        });
        
        // 選択肢が画面の下部にある場合は選択した選択肢が見えるようにスクロール
        const selectedButton = Array.from(currentOptions).find(button => button.textContent === selectedOption);
        if (selectedButton) {
            scrollToLatestContent(selectedButton, 150);
        }
    }
    
    // フォーム完了時の処理
    function handleFormCompletion() {
        if (currentFormType === 'ipss') {
            // IPSSが終了したら、EQ-5Dに進む
            setTimeout(() => {
                // 複数のメッセージを遅延を入れて表示
                addBotMessages([
                    "前半の質問は終了しました。続いて後半の質問に移ります。",
                    "後半では、生活の質についてお聞きします。"
                ]);
                
                // 次のフォームの最初の質問を表示（最後のメッセージから十分な時間をあけて）
                setTimeout(() => {
                    currentFormType = 'eq5d';
                    currentQuestionIndex = 0;
                    showQuestion(currentQuestionIndex);
                }, 1200);
            }, 600);
        } else if (currentFormType === 'eq5d') {
            // EQ-5Dが終了したら、結果を表示
            setTimeout(() => {
                showResults();
            }, 600);
        }
    }
    
    // 結果を表示する関数
    function showResults() {
        const messageDiv = addMessage("全ての質問が終了しました。ご協力ありがとうございました。", false);
        
        // 結果セクションを表示
        setTimeout(() => {
            // 結果メッセージを設定
            const resultMessage = "院内でご回答の方は、端末をスタッフにご提示ください。<br>オンラインでご回答の方は、以下のボタンからPSA値の入力画面に進んでください。";
            $('#resultMessage').html(resultMessage);
            
            // 結果セクションを表示
            $('#resultSection').show();
            
            // 結果の要約を非表示にする
            $('#resultSummary').hide();
            
            // オンライン回答ボタンの生成（mail-linkクラスをonline-buttonクラスに変更）
            const onlineButton = '<a href="#psaSection" class="online-button" id="onlineButton">オンラインで回答の方はこちら</a>';
            $('#mailContainer').html(onlineButton);
            
            // オンライン回答ボタンのクリックイベント
            $('#onlineButton').on('click', function(e) {
                e.preventDefault();
                
                // PSA入力フォームを表示
                $('#psaSection').show();
                
                // フォームまでスクロール
                $('html, body').animate({
                    scrollTop: $('#psaSection').offset().top - 50
                }, 600);
            });
            
            // QRコードの生成
            generateQRCode(answers);
            
            // 結果セクションまでスクロール
            setTimeout(() => {
                $('html, body').animate({
                    scrollTop: $('#resultSection').offset().top - 50
                }, 600);
            }, 200);
        }, 1000);
    }
    
    // フォーマットされたテキストを生成する関数
    function generateFormattedText(data) {
        // 現在の日付を取得
        const today = new Date();
        const dateString = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;
        
        // フォーマットされたテキストを生成
        let formattedText = `入力日：${dateString}\r\n`;
        
        // IPSSの結果を追加
        if (data.ipss && data.ipss.length > 0) {
            formattedText += `【IPSS-QOLスコア】\r\n`;
            
            // IPSSスコアを取得（0点始まり）
            const ipssScores = data.ipss.slice(0, 7).map(answer => {
                const index = questions.ipss.findIndex((q, i) => i < 7 && q.options.indexOf(answer) !== -1);
                return index !== -1 ? questions.ipss[index].options.indexOf(answer) : 0;
            });
            
            // QOLスコアを取得（0点始まり）
            const qolScore = data.ipss[7] ? questions.ipss[7].options.indexOf(data.ipss[7]) : 0;
            
            // 合計点を計算
            const ipssTotal = ipssScores.reduce((sum, score) => sum + score, 0);
            
            // スコアを追加
            formattedText += `IPSS-QOL：${ipssScores.join('-')}-${qolScore}\r\n`;
            formattedText += `IPSS-QOL合計点：${ipssTotal}点\r\n`;
        }
        
        // EQ-5Dの結果を追加
        if (data.eq5d && data.eq5d.length > 0) {
            formattedText += `【EQ-5D】\r\n`;
            
            // EQ-5Dスコアを取得（最初の5問、0点始まり）
            const eq5dScores = data.eq5d.slice(0, 5).map(answer => {
                const index = questions.eq5d.findIndex((q, i) => i < 5 && q.options.indexOf(answer) !== -1);
                return index !== -1 ? questions.eq5d[index].options.indexOf(answer) : 0;
            });
            
            // スコアを追加
            formattedText += `EQ-5D：${eq5dScores.join('-')}\r\n`;
            
            // VASの値を追加（6問目）
            if (data.eq5d[5]) {
                formattedText += `健康状態(VAS)：${data.eq5d[5]}/100\r\n`;
            }
        }
        
        return formattedText;
    }
    
    // Excel用のCSV形式テキストを生成する関数
    function generateCsvText(data) {
        // 現在の日付を取得
        const today = new Date();
        const dateString = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;
        
        // ヘッダー行を作成
        let headers = ["Date"];
        let values = [dateString];
        
        // IPSSの結果を追加
        if (data.ipss && data.ipss.length > 0) {
            // IPSSスコアを取得（0点始まり）
            const ipssScores = data.ipss.slice(0, 7).map(answer => {
                const index = questions.ipss.findIndex((q, i) => i < 7 && q.options.indexOf(answer) !== -1);
                return index !== -1 ? questions.ipss[index].options.indexOf(answer) : 0;
            });
            
            // QOLスコアを取得（0点始まり）
            const qolScore = data.ipss[7] ? questions.ipss[7].options.indexOf(data.ipss[7]) : 0;
            
            // ヘッダーとスコアを追加
            for (let i = 0; i < ipssScores.length; i++) {
                headers.push(`IPSS-QOL-Q${i+1}`);
                values.push(ipssScores[i]);
            }
            
            headers.push("IPSS-QOL-QOL");
            values.push(qolScore);
        }
        
        // EQ-5Dの結果を追加
        if (data.eq5d && data.eq5d.length > 0) {
            // EQ-5Dスコアを取得（最初の5問、0点始まり）
            const eq5dScores = data.eq5d.slice(0, 5).map(answer => {
                const index = questions.eq5d.findIndex((q, i) => i < 5 && q.options.indexOf(answer) !== -1);
                return index !== -1 ? questions.eq5d[index].options.indexOf(answer) : 0;
            });
            
            // ヘッダーとスコアを追加
            for (let i = 0; i < eq5dScores.length; i++) {
                headers.push(`EQ-5D-Q${i+1}`);
                values.push(eq5dScores[i]);
            }
            
            // VASの値を追加（6問目）
            if (data.eq5d[5]) {
                headers.push("EQ-5D-VAS");
                values.push(data.eq5d[5]);
            }
        }
        
        // タブ区切りのCSV形式で出力（改行コードを\rに変更）
        return headers.join('\t') + '\r' + values.join('\t');
    }
    
    // QRコード生成関数
    function generateQRCode(data) {
        // 現在のQRコード表示エリアをクリア
        $('#qrcode').empty();
        
        // QRコード表示エリアを作成
        const qrContainer = $('<div class="qr-container"></div>');
        const qrDisplay = $('<div id="qrDisplay"></div>');
        const qrSwitchButtons = $('<div class="qr-switch-buttons"></div>');
        
        // 通常形式ボタン
        const normalButton = $('<button class="qr-switch-btn active">通常形式</button>');
        normalButton.on('click', function() {
            $(this).addClass('active').siblings().removeClass('active');
            generateNormalQR(data);
        });
        
        // Excel形式ボタン
        const excelButton = $('<button class="qr-switch-btn">Excel形式</button>');
        excelButton.on('click', function() {
            $(this).addClass('active').siblings().removeClass('active');
            generateExcelQR(data);
        });
        
        // ボタンを追加
        qrSwitchButtons.append(normalButton).append(excelButton);
        
        // コンテナに要素を追加
        qrContainer.append(qrDisplay).append(qrSwitchButtons);
        $('#qrcode').append(qrContainer);
        
        // デフォルトで通常形式のQRコードを表示
        generateNormalQR(data);
    }
    
    // 通常形式のQRコードを生成
    function generateNormalQR(data) {
        const formattedText = generateFormattedText(data);
        
        // UTF-8からShift_JISに変換
        const utf8Array = Encoding.stringToCode(formattedText);
        const sjisArray = Encoding.convert(utf8Array, {
            to: 'SJIS',
            from: 'UNICODE'
        });
        
        // バイナリ文字列に変換
        const sjisStr = Encoding.codeToString(sjisArray);
        
        // QRコード生成
        $('#qrDisplay').empty().qrcode({
            width: 256,
            height: 256,
            text: sjisStr
        });
        
        // QRコードの下に説明を追加
        $('#qrDisplay').append('<p class="qr-description">通常形式：問診結果の詳細</p>');
    }
    
    // Excel形式のQRコードを生成
    function generateExcelQR(data) {
        const csvText = generateCsvText(data);
        
        // UTF-8からShift_JISに変換
        const utf8Array = Encoding.stringToCode(csvText);
        const sjisArray = Encoding.convert(utf8Array, {
            to: 'SJIS',
            from: 'UNICODE'
        });
        
        // バイナリ文字列に変換
        const sjisStr = Encoding.codeToString(sjisArray);
        
        // QRコード生成
        $('#qrDisplay').empty().qrcode({
            width: 256,
            height: 256,
            text: sjisStr
        });
        
        // QRコードの下に説明を追加
        $('#qrDisplay').append('<p class="qr-description">Excel形式：タブ区切りCSV（Excelに貼り付け可能）</p>');
    }
    
    // ウィンドウサイズ変更時にもスクロール位置を調整
    $(window).on('resize', function() {
        if (currentQuestionIndex > 0) {
            // 現在の質問のオプションが見えるようにスクロール
            const currentSelector = `.options[data-question-id="${questions[currentFormType][Math.min(currentQuestionIndex, questions[currentFormType].length - 1)].id}"]`;
            const currentElement = document.querySelector(currentSelector);
            if (currentElement) {
                scrollToLatestContent(currentElement);
            }
        }
    });
    
    // フォーム名を取得する関数
    function getFormTitle(form) {
        switch (form) {
            case 'ipss': return 'IPSS-QOLスコア';
            case 'eq5d': return 'EQ-5D';
            case 'epic': return 'EPIC（前立腺癌QOL）';
            default: return '';
        }
    }

    function getDocCode(form) {
        switch (form) {
            case 'ipss': return 'IPSS';
            case 'eq5d': return 'EQ5D';
            case 'epic': return 'EPIC';
            default: return '';
        }
    }

    // PSA値の入力内容を文字列に変換する関数
    function generatePsaText() {
        let psaText = '【PSA検査値】\r\n';
        let hasData = false;
        
        // 3回分のPSA値をチェック
        for (let i = 1; i <= 3; i++) {
            const date = $(`#psaDate${i}`).val();
            const value = $(`#psaValue${i}`).val();
            
            if (date && value) {
                hasData = true;
                psaText += `${date}：${value} ng/mL\r\n`;
            }
        }
        
        return hasData ? psaText : '';
    }

    // PSA入力フォームの送信処理
    $(document).on('click', '#psaSubmitButton', function() {
        // フォーマットされたテキストを生成
        const formattedText = generateFormattedText(answers);
        
        // PSA値の入力内容を追加
        const psaText = generatePsaText();
        
        // メール本文を作成
        const mailBody = encodeURIComponent(formattedText + psaText);
        
        // メールクライアントを開く（確認なしで直接開く）
        window.location.href = `mailto:example@example.com?subject=問診結果&body=${mailBody}`;
    });
});
