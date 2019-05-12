$('#playeraddform').on('submit', addPlayer);
$('#numberform').on('submit', hitNumber);
$('#importform').on('submit', importFields);
$('#fieldSizeSlider').on('change', updateSizes);

let fieldTemplate = "<div class='bingo-field'>Player: {player}<br>{squares}</div>";
let squareTemplate = '<div class="bingo-square {NUM}{CENTER}" id="{player}-{NUM}">{NUM}</div>';
let currentFields = [];
let hitNumbers = [];
let playerBingos = [];
let bingos = [
    // center doesn't count as it's supposed to always be "set"
    // rows
    0b1111100000000000000000000,
    0b0000011111000000000000000,
    0b0000000000110110000000000,
    0b0000000000000001111100000,
    0b0000000000000000000011111,
    // columns
    0b0000100001000010000100001,
    0b0001000010000100001000010,
    0b0010000100000000010000100,
    0b0100001000010000100001000,
    0b1000010000100001000010000,
    //diagonals
    0b1000001000000000001000001,
    0b0000100010000000100010000
];

function addPlayer(random = true, board = [], playername = '') {
    let name;
    if (random) {
        name = $('#playernameinput').val();
    } else {
        name = playername;
    }
    let newField = fieldTemplate;
    let squares = "";
    let takenNums = [];
    for (let i = 0; i < 25; i++) {
        let num;
        if (random) {
            do {
                num = Math.floor(Math.random() * 99 + 1);
            } while (takenNums.includes(num));
        } else {
            num = board[i];
        }
        takenNums.push(num);
        squares = squares + (i > 0 && i % 5 === 0 ? '<br>' : '') +
            squareTemplate.replace(/{NUM}/g, num)
                .replace(/{player}/g, name)
                .replace(/{CENTER}/g, i === 12 ? ' bingo-center' : '');
    }
    newField = newField.replace(/{squares}/g, squares).replace(/{player}/g, name);
    $('#mainfield').html($('#mainfield').html() + newField);
    $('#playernameinput').val('');
    currentFields.push({'player': name, 'field': takenNums});
    $('#exportfield').val(JSON.stringify(currentFields));
    return false;
}


function hitNumber() {
    let num = $('#numberinput').val();
    $('.' + num).css('background', 'green');
    $('#numberinput').val('');
    for (let field of currentFields) {
        if (playerBingos.includes(field['player'])) {
            continue;
        }
        let binaryField = 0;
        for (let n of field['field']) {
            if ($('#' + field['player'] + '-' + n).css('background-color') === 'rgb(0, 128, 0)') {
                binaryField += 1;
            }
            binaryField = binaryField << 1;
        }
        binaryField = binaryField >> 1;
        for (let bingo of bingos) {
            let anded = binaryField & bingo;
            if (anded === bingo) {
                setTimeout(alert, 100, [field['player'] + ' got a Bingo!']);
                playerBingos.push(field['player']);
            }
        }
    }
    return false;
}


function updateSizes() {
    let val = $('#fieldSizeSlider').val();
    $('.bingo-square').css('width', val + 'em').css('height', val + 'em').css('font-size', 'calc(100% * ' + val + ')')
}


function importFields() {
    let inputString = $('#importinput').val();
    try {
        let fields = JSON.parse(inputString);
        for (let field of fields) {
            addPlayer(false, field['field'], field['player']);
        }
    } catch (e) {
        alert('Something went wrong: ' + e.toString());
    }

    return false;
}

function clearFields() {
    $('#mainfield').html('');
    currentFields = [];
    $('#exportfield').val('[]');
    playerBingos = [];
}
