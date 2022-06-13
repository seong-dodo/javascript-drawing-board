class DrawingBoard {
  // NONE, BRUSH, ERASER
  MODE = "NONE";
  IsMouseDown = false;
  backgroundColor = "#FFFFFF";
  eraserColor = "#FFFFFF";
  IsNavigatorVisible = false;
  undoArray = [];
  containerEl;
  canvasEl;
  toolBarEl;
  brushEl;
  colorPickerEl;
  brushPanelEl;
  brushSliderEl;
  brushSizePreviewEl;
  eraserEl;
  navigatorEl;
  navigatorImageContainerEl;
  navigatorImageEl;
  undoEl;
  clearEl;
  downloadLinkEl;

  constructor() {
    this.assingElement();
    this.initContext();
    this.initCanvasBackgroundColor();
    this.addEvent();
  }
  assingElement() {
    this.containerEl = document.getElementById("container");
    this.canvasEl = this.containerEl.querySelector("#canvas");
    this.toolBarEl = this.containerEl.querySelector("#toolbar");
    this.brushEl = this.toolBarEl.querySelector("#brush");
    this.colorPickerEl = this.toolBarEl.querySelector("#colorPicker");
    this.brushPanelEl = this.containerEl.querySelector("#brushPanel");
    this.brushSliderEl = this.brushPanelEl.querySelector("#brushSize");
    this.brushSizePreviewEl =
      this.brushPanelEl.querySelector("#brushSizePreview");
    this.eraserEl = this.toolBarEl.querySelector("#eraser");
    this.navigatorEl = this.toolBarEl.querySelector("#navigator");
    this.navigatorImageContainerEl = this.containerEl.querySelector("#imgNav");
    this.navigatorImageEl =
      this.navigatorImageContainerEl.querySelector("#canvasImg");
    this.undoEl = this.toolBarEl.querySelector("#undo");
    this.clearEl = this.toolBarEl.querySelector("#clear");
    this.downloadLinkEl = this.toolBarEl.querySelector("#download");
  }
  initContext() {
    this.context = this.canvasEl.getContext("2d");
  }
  initCanvasBackgroundColor() {
    this.context.fillStyle = this.backgroundColor;
    this.context.fillRect(0, 0, this.canvasEl.width, this.canvasEl.height);
  }
  addEvent() {
    this.brushEl.addEventListener("click", this.onClickBursh.bind(this));
    this.canvasEl.addEventListener("mousedown", this.onMouseDown.bind(this));
    this.canvasEl.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.canvasEl.addEventListener("mouseup", this.onMouseUp.bind(this));
    this.canvasEl.addEventListener("mouseout", this.onMouseOut.bind(this));
    this.brushSliderEl.addEventListener(
      "input",
      this.onChangeBrushSize.bind(this)
    );
    this.colorPickerEl.addEventListener("input", this.onChangeColor.bind(this));
    this.eraserEl.addEventListener("click", this.onClickEraser.bind(this));
    this.navigatorEl.addEventListener(
      "click",
      this.onClickNavigator.bind(this)
    );
    this.undoEl.addEventListener("click", this.onClickUndo.bind(this));
    this.clearEl.addEventListener("click", this.onClickClear.bind(this));
    this.downloadLinkEl.addEventListener(
      "click",
      this.onClickDownload.bind(this)
    );
  }
  onClickDownload() {
    this.downloadLinkEl.href = this.canvasEl.toDataURL("image/jpeg", 1);
    this.downloadLinkEl.download = "exmaple.jpeg";
  }
  onClickClear() {
    this.context.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
    this.undoArray = [];
    this.updateNavigator();
    this.initCanvasBackgroundColor();
  }
  onClickUndo() {
    if (this.undoArray.length === 0) {
      alert("더 이상 실행 취소가 불가능 합니다!");
    }

    let previousDataUrl = this.undoArray.pop();
    let previousImage = new Image();
    previousImage.onload = () => {
      this.context.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
      this.context.drawImage(
        previousImage,
        0,
        0,
        this.canvasEl.width,
        this.canvasEl.height,
        0,
        0,
        this.canvasEl.width,
        this.canvasEl.height
      );
    };

    previousImage.src = previousDataUrl;
  }
  saveState() {
    this.undoArray.push(this.canvasEl.toDataURL());
    // if (this.undoArray.length > 4) {
    //   this.undoArray.shift();
    //   this.undoArray.push(this.canvasEl.toDataURL());
    // } else {
    //   this.undoArray.push(this.canvasEl.toDataURL());
    // }
  }
  onClickNavigator(event) {
    this.IsNavigatorVisible = !event.currentTarget.classList.contains("active");
    event.currentTarget.classList.toggle("active");
    this.navigatorImageContainerEl.classList.toggle("hide");
    this.updateNavigator();
  }
  updateNavigator() {
    if (!this.IsNavigatorVisible) return;
    this.navigatorImageEl.src = this.canvasEl.toDataURL();
  }
  onClickEraser(event) {
    const IsActive = event.currentTarget.classList.contains("active");
    this.MODE = IsActive ? "NONE" : "ERASER";
    this.canvasEl.style.cursor = IsActive ? "default" : "crosshair";
    this.brushPanelEl.classList.toggle("hide");
    this.eraserEl.classList.toggle("active");
    this.brushEl.classList.remove("active");
  }
  onMouseOut() {
    if (this.MODE === "NONE") return;
    this.IsMouseDown = false;
    this.updateNavigator();
  }
  onChangeColor() {
    this.brushSizePreviewEl.style.background = this.colorPickerEl.value;
  }
  onChangeBrushSize(event) {
    this.brushSizePreviewEl.style.width = `${event.target.value}px`;
    this.brushSizePreviewEl.style.height = `${event.target.value}px`;
  }
  /**
   * 캔버스 그리기 이벤트
   * 1. "브러쉬 모드"일 경우 그림이 그려지는 로직 구현하기
   *
   */
  onMouseDown(event) {
    if (this.MODE === "NONE") return;
    this.IsMouseDown = true;
    const currentPosition = this.getMousePosition(event);
    this.context.beginPath();
    this.context.moveTo(currentPosition.x, currentPosition.y);
    this.context.lineCap = "round";

    if (this.MODE === "BRUSH") {
      this.context.strokeStyle = this.colorPickerEl.value;
      this.context.lineWidth = this.brushSliderEl.value;
    } else if (this.MODE === "ERASER") {
      this.context.strokeStyle = this.eraserColor;
      this.context.lineWidth = 50;
    }
    this.saveState();
  }
  onMouseMove(event) {
    if (!this.IsMouseDown) return;
    const currentPosition = this.getMousePosition(event);
    this.context.lineTo(currentPosition.x, currentPosition.y);
    this.context.stroke();
  }
  onMouseUp() {
    if (this.MODE === "NONE") return;
    this.IsMouseDown = false;
    this.updateNavigator();
  }
  /**
   * 마우스 현재 위치 구하기
   */
  getMousePosition(event) {
    const boundaries = this.canvasEl.getBoundingClientRect();

    return {
      x: event.clientX - boundaries.left,
      y: event.clientY - boundaries.top,
    };
  }
  /**
   * 브러쉬 클릭 이벤트
   * 1. 브러쉬 아이콘 클릭하면 active 클래스 주기
   * 2. 브러쉬 아이콘 클릭하면 "브러쉬 모드"가 된다.
   */
  onClickBursh(event) {
    const IsActive = event.currentTarget.classList.contains("active");
    this.MODE = IsActive ? "NONE" : "BRUSH";
    this.canvasEl.style.cursor = IsActive ? "default" : "crosshair";
    this.brushPanelEl.classList.toggle("hide");
    this.brushEl.classList.toggle("active");
    this.eraserEl.classList.remove("active");
  }
}

new DrawingBoard();
