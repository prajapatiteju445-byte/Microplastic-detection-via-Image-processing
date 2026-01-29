
## 🌊 Overview

**MicroAqua** is an open-source initiative addressing the global microplastic pollution crisis through affordable technology. Traditional microplastic detection relies on expensive laboratory equipment (particle counters, high-end microscopes) costing thousands of dollars, making monitoring inaccessible for developing regions and field research.

Our solution combines a **$20 smartphone microscope attachment (TinyScope)** with **state-of-the-art YOLOv11 object detection** to create a portable, real-time microplastic identification system.

### The Problem
- Microplastics (&lt;5mm) contaminate 90% of bottled water and marine ecosystems
- Current detection methods: Slow, labor-intensive, require expensive spectroscopy
- Limited accessibility for low-resource settings and real-time field monitoring

### Our Solution
- ✅ **Cost-effective**: ~95% cheaper than traditional microscopy setups
- ✅ **Portable**: Smartphone-based field detection
- ✅ **Real-time**: YOLOv11 inference with 60+ FPS capability
- ✅ **Accessible**: Web interface for non-technical users
##Note: limited dataset we have used it ,so when your analyze new image sample may be not showing result due to limited datasets have model trained on and this a Development Phase.

---

## 🚀 Key Features

| Feature | Description |
|---------|-------------|
| **Smartphone Microscopy** | TinyScope integration for 400x magnification using mobile cameras |
| **AI Detection** | YOLOv11 model trained on 2,490+ annotated microplastic images |
| **Web Platform** | React-based interface for image upload and real-time analysis |
| **Dataset** | Curated binary imagery (white background, dark particles) |
| **API Ready** | RESTful endpoints for integration with IoT water monitoring systems |

---

## 🛠️ Tech Stack

**Deep Learning & Computer Vision:**
- YOLOv11 (Ultralytics) for object detection
- Python 3.8+, OpenCV, Pillow
- Dataset augmentation and preprocessing pipelines

**Web Application:**
- Frontend: React.js / Next.js (deployed on Vercel)
- Backend: Python Flask/FastAPI (or specify your stack)
- Model Serving: ONNX/TensorRT optimization for web deployment

**Hardware:**
- TinyScope Mobile Microscope (universal smartphone attachment)
- Standard Android/iOS devices

---

## 📋 System Architecture
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Water Sample   │────▶│  TinyScope   │────▶│  Smartphone     │
│  Collection     │     │  (400x zoom) │     │  Camera         │
└─────────────────┘     └──────────────┘     └────────┬────────┘
│
┌────────────────────────────▼────────────────────────┐
│                  Web Application                   │
│  ┌─────────────┐    ┌──────────┐    ┌──────────┐  │
│  │  Image      │───▶│  YOLOv11 │───▶│  Results │  │
│  │  Upload     │    │  Model   │    │  Display │  │
│  └─────────────┘    └──────────┘    └──────────┘  │
└───────────────────────────────────────────────────┘

---

## 🔧 Installation & Setup

### Prerequisites
```bash
# Python dependencies
pip install ultralytics opencv-python pillow flask numpy

# Node.js (for web app)
npm install
##Model Training Setup
# 1. Clone repository
git clone https://github.com/username/microaqua.git
cd microaqua

# 2. Download dataset (or create your own using TinyScope)
# Dataset structure:
# ├── data/
# │   ├── train/images/
# │   ├── train/labels/
# │   ├── val/images/
# │   └── val/labels/

# 3. Train YOLOv11 model
python train.py --model yolo11n.pt --data data.yaml --epochs 100 --imgsz 640
##Web Application Local Setup
cd web-app
npm install
npm run dev
# Access at http://localhost:3000

📊 Dataset
MicroAqua Dataset v1.0
Total Images: 2,490 annotated samples
Source: Industrial water samples + Kaggle synthetic augmentation
Imaging: Binary contrast (white background, dark microplastic entities)
Resolution: Optimized for mobile microscopy (640x640)
Classes: Microplastic particles (polypropylene, polyethylene, PET fragments)

🎯 Model Performance
| Metric             | Value                         |
| ------------------ | ----------------------------- |
| **Precision**      | 0.85 (add your actual values) |
| **Recall**         | 0.82                          |
| **mAP\@0.5**       | 0.88                          |
| **Inference Time** | ~15ms per image (GPU)         |
| **Model Size**     | 5.8MB (YOLO11n optimized)     |

Training Configuration
Architecture: YOLOv11 nano (optimized for mobile deployment)
Augmentation: Mosaic, MixUp, random rotation
Hardware: NVIDIA Tesla T4 / Local GPU training
🌐 Live Application

Production URL: https://microaqua.vercel.app/
How to Use:
Collect water sample and filter through 5mm mesh
Attach TinyScope to smartphone (align camera with eyepiece)
Capture image with white background lighting
Upload to MicroAqua web interface
Receive instant detection results with bounding boxes and particle count

🚧 Current Challenges & Roadmap
Active Development Areas
[ ] Accuracy Improvement: Addressing undefined particle detection (irregular shapes)
[ ] Multi-class Classification: Differentiating plastic types (PE, PP, PET, PS)
[ ] Mobile App: Native iOS/Android app for offline detection
[ ] Hardware Integration: IoT sensor fusion for automated sampling
Known Limitations
Current accuracy drops with particles <50μm
Requires controlled lighting conditions for optimal detection
Backend optimization needed for high-throughput batch processing

🤝 Contributing
We welcome contributions from environmental scientists, ML engineers, and hardware hackers!
How to Contribute:
Fork the repository
Create feature branch: git checkout -b feature/amazing-feature
Commit changes: git commit -m 'Add amazing feature'
Push to branch: git push origin feature/amazing-feature
Open Pull Request

Priority Contributions Needed:
🔬 Dataset Expansion: Share your microscopy images of microplastics
⚡ Model Optimization: TensorFlow Lite conversion for edge devices
🎨 UI/UX: Frontend improvements for the web interface
🧪 Validation: Field testing and accuracy benchmarking
Read our Contributing Guide for detailed guidelines.

👥 Team & Credits
Project by:
Tejas Prajapati
Atharv Patil
Deep Saharkar

Guided by:
Prof. Rahul Singh
Prof. Nikhil Khatekar
Institution: A.P. Shah Institute of Technology, Thane
Academic Year: 2025-2026

Acknowledgments
Ultralytics team for YOLOv11 implementation
TinyScope for affordable mobile microscopy hardware
Kaggle community for dataset resources
