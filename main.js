"use strict"
// SELECT ELEMENTS
const btnNewGame = document.querySelector(".btn--new-game")
const btnHit = document.querySelector(".btn--hit")
const btnStand = document.querySelector(".btn--stand")
const dealerArea = document.querySelector(".game--dealer .game-card")
const dealTitle = document.querySelector(".game--dealer .game-title")
const playerArea = document.querySelector(".game--player .game-card")
const playTitle = document.querySelector(".game--player .game-title")
const message = document.querySelector(".button-heading")

// VARIABLES
const suits = ["spade", "heart", "diamond", "club"]
const startCodePoints = [127137, 127153, 127169, 127185]
const numberNeedToBeSkiped = [127148, 127151, 127152, 127164, 127]

const numberOfCardsOfEachSuit = 14

let isGameOn = false
let isBust = false

let cards = []
let shuffledCards = []

let dealerCards = []
let playerCards = []

let dealerScore = 0
let playerScore = 0

// create 52 cards ---------------------------
// SECTION

const createPlayingCards = function () {
  cards = []
  // create 13 cards for each suit
  // use for-loop becoz need use continue
  for (let i = 0; i < suits.length; i++) {
    for (let j = 0; j < numberOfCardsOfEachSuit; j++) {
      const currentCodePoint = startCodePoints[i] + j
      const numbersNeedToBeSkipped = [
        startCodePoints[i] + numberOfCardsOfEachSuit - 3,
        startCodePoints[i] + numberOfCardsOfEachSuit,
        startCodePoints[i] + numberOfCardsOfEachSuit + 1,
      ]

      // check unicode validation
      if (numbersNeedToBeSkipped.includes(currentCodePoint)) continue

      cards.push({
        codePoint: currentCodePoint,
        suit: suits[i],
        // make JQK's value = 10
        value: j + 1 >= 10 ? 10 : j + 1,
      })
    }
  }
}

createPlayingCards()

// shuffle deck ---------------------------
// SECTION

const shuffle = function () {
  shuffledCards = []
  // make a cards copy
  let copyCards = cards.slice(0)

  for (let i = copyCards.length - 1; i >= 0; i--) {
    const random = Math.floor(Math.random() * copyCards.length)
    shuffledCards.push(copyCards[random])
    copyCards.splice(random, 1)
  }
}

shuffle()

// helper functionssssss ---------------------------
// SECTION

// HELPER
const deal = function (target = playerCards) {
  const random = Math.floor(Math.random() * shuffledCards.length)
  target.push(shuffledCards[random])
  shuffledCards.splice(random, 1)
}

// HELPER
const renderCards = function (cards, el) {
  el.innerHTML = ``

  // prettier-ignore
  const html = cards.map((card, i) =>
        `<span class="card card-${i + 1}">&#${card.codePoint};</span>`
    ).join("")

  el.insertAdjacentHTML("afterbegin", html)

  // cover dealer's second card
  if (cards === dealerCards)
    dealerArea.querySelector(".card-2").innerHTML = `&#127136;`
}

// HELPER
// prettier-ignore
const showDealerSecondCard = () =>
  (dealerArea.querySelector(".card-2").innerHTML = `&#${dealerCards[1].codePoint};`)

// HELPER
const checkHaveA = (cards) =>
  cards.some((card) => startCodePoints.includes(card.codePoint))

// HELPER
const calcScore = function () {
  // if dealer/player get A will score will add 10
  dealerScore = dealerCards.reduce(
    (acc, card) => (acc += card.value),
    checkHaveA(dealerCards) ? 10 : 0
  )

  playerScore = playerCards.reduce(
    (acc, card) => (acc += card.value),
    checkHaveA(playerCards) ? 10 : 0
  )

  // if dealer/player get A and over 21 will minus 10
  if (playerScore > 21 || dealerScore > 21) {
    if (checkHaveA(playerCards)) playerScore -= 10
    if (checkHaveA(dealerCards)) dealerScore -= 10
  }

  // if after minus 10 still higher than 21
  if (playerScore > 21 || dealerScore > 21) {
    isBust = true
    showDealerSecondCard()
  }
}

// HELPER
const reset = function () {
  createPlayingCards()
  shuffle()
  dealerCards = []
  playerCards = []
  dealerScore = 0
  playerScore = 0
  dealerArea.innerHTML = ``
  playerArea.innerHTML = ``
  dealTitle.innerHTML = `dealer's cards`
  playTitle.innerHTML = `your cards`
  isBust = false
}

// HELPER
const renderMessage = function () {
  message.textContent = isBust
    ? `You have ${playerScore}, you lost!`
    : `You have ${playerScore}, hit or stand?`

  if (playerScore === 21) message.textContent = `You got 21, you win!`
}

// START NEW GAME ---------------------------
// SECTION
const startNewGame = function () {
  isGameOn = true

  reset()

  // deal to player first and then dealer
  for (let i = 0; i < 4; i++) {
    i % 2 ? deal(dealerCards) : deal(playerCards)
  }

  //   render cards
  renderCards(dealerCards, dealerArea)
  renderCards(playerCards, playerArea)

  //   calculate score
  calcScore()

  // render message
  renderMessage()
}

btnNewGame.addEventListener("click", startNewGame)

// HIT ---------------------------
// SECTION

btnHit.addEventListener("click", hit)

function hit() {
  // disfunction this button if haven't start a game and won already
  if (!isGameOn || playerScore === 21) return

  deal()
  renderCards(playerCards, playerArea)
  calcScore()
  renderMessage()

  // check if player got black jack
  if (playerScore === 21) {
    showDealerSecondCard()
    isGameOn = false
  }
}

// STAND ---------------------------
// SECTION
const stand = function () {
  // disfunction this button if haven't start a game
  if (!isGameOn) return

  // dealer need to keep drawing if score lower than 17
  while (dealerScore < 17) {
    deal(dealerCards)
    renderCards(dealerCards, dealerArea)
    calcScore()
  }
  showDealerSecondCard()

  // show both scores
  dealTitle.textContent = `Dealer has: ${dealerScore}`
  playTitle.textContent = `Player has: ${playerScore}`

  // render message for different scenario
  if (dealerScore > 21) message.textContent = `Dealer busts, you won!`
  if (dealerScore <= 21) {
    dealerScore < playerScore
      ? (message.textContent = `You won!`)
      : (message.textContent = `Dealer won!`)
  }
  if (dealerScore === playerScore) {
    if (dealerCards.length > playerCards.length)
      message.textContent = `Values tie, You won with fewer cards!`
    if (playerCards.length > dealerCards.length)
      message.textContent = `Values tie, dealer won with fewer cards!`
    if (dealerCards.length === playerCards.length)
      message.textContent = `Values tie, You won with same amount of cards!`
  }

  isGameOn = false
}

btnStand.addEventListener("click", stand)
