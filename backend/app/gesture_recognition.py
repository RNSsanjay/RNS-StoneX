import cv2
import mediapipe as mp
import numpy as np
from typing import Optional, Tuple, List, Dict, Any
import base64

class HandGestureRecognizer:
    """Hand gesture recognition for Rock Paper Scissors using MediaPipe"""
    
    def __init__(self):
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=1,
            min_detection_confidence=0.8,  # Increased from 0.7
            min_tracking_confidence=0.7,   # Increased from 0.5
            model_complexity=1             # Use more complex model for better accuracy
        )
        self.mp_draw = mp.solutions.drawing_utils
        
    def recognize_gesture(self, image_data: str) -> Dict[str, Any]:
        """
        Recognize hand gesture from base64 image data
        Returns: {"gesture": str, "confidence": float, "landmarks": List}
        """
        try:
            # Decode base64 image
            image_bytes = base64.b64decode(image_data.split(',')[1])
            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if image is None:
                return {"gesture": "none", "confidence": 0.0, "landmarks": []}

            # Enhanced image preprocessing
            processed_image = self._preprocess_image(image)

            # Convert BGR to RGB
            rgb_image = cv2.cvtColor(processed_image, cv2.COLOR_BGR2RGB)

            # Process the image
            results = self.hands.process(rgb_image)
            
            if results.multi_hand_landmarks:
                hand_landmarks = results.multi_hand_landmarks[0]
                landmarks = self._extract_landmarks(hand_landmarks)
                gesture, confidence = self._classify_gesture(landmarks)
                
                return {
                    "gesture": gesture,
                    "confidence": confidence,
                    "landmarks": landmarks,
                    "detected": True
                }
            else:
                return {
                    "gesture": "none",
                    "confidence": 0.0,
                    "landmarks": [],
                    "detected": False
                }
                
        except Exception as e:
            print(f"Gesture recognition error: {e}")
            return {"gesture": "error", "confidence": 0.0, "landmarks": []}
    
    def _extract_landmarks(self, hand_landmarks) -> List[List[float]]:
        """Extract normalized landmark coordinates"""
        landmarks = []
        for landmark in hand_landmarks.landmark:
            landmarks.append([landmark.x, landmark.y, landmark.z])
        return landmarks

    def _preprocess_image(self, image: np.ndarray) -> np.ndarray:
        """Enhanced image preprocessing for better hand detection"""
        # Convert to grayscale for preprocessing
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)

        # Convert back to BGR
        processed = cv2.cvtColor(enhanced, cv2.COLOR_GRAY2BGR)

        # Apply slight Gaussian blur to reduce noise
        processed = cv2.GaussianBlur(processed, (3, 3), 0)

        # Enhance contrast slightly
        lab = cv2.cvtColor(processed, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        l = clahe.apply(l)
        lab = cv2.merge((l, a, b))
        processed = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)

        return processed
    
    def _classify_gesture(self, landmarks: List[List[float]]) -> Tuple[str, float]:
        """
        Enhanced gesture classification with improved finger detection and hand pose analysis
        Returns: (gesture_name, confidence_score)
        """
        if len(landmarks) < 21:  # MediaPipe returns 21 landmarks
            return "none", 0.0

        # Key landmark indices for better finger detection
        wrist = landmarks[0]

        # Thumb landmarks
        thumb_cmc = landmarks[1]
        thumb_mcp = landmarks[2]
        thumb_ip = landmarks[3]
        thumb_tip = landmarks[4]

        # Index finger landmarks
        index_mcp = landmarks[5]
        index_pip = landmarks[6]
        index_dip = landmarks[7]
        index_tip = landmarks[8]

        # Middle finger landmarks
        middle_mcp = landmarks[9]
        middle_pip = landmarks[10]
        middle_dip = landmarks[11]
        middle_tip = landmarks[12]

        # Ring finger landmarks
        ring_mcp = landmarks[13]
        ring_pip = landmarks[14]
        ring_dip = landmarks[15]
        ring_tip = landmarks[16]

        # Pinky landmarks
        pinky_mcp = landmarks[17]
        pinky_pip = landmarks[18]
        pinky_dip = landmarks[19]
        pinky_tip = landmarks[20]

        # Calculate finger states with improved logic
        fingers_up = self._calculate_finger_states(landmarks)

        # Classify based on finger states with enhanced logic
        gesture, confidence = self._determine_gesture_from_fingers_enhanced(fingers_up, landmarks)

        return gesture, confidence

    def _calculate_finger_states(self, landmarks: List[List[float]]) -> List[int]:
        """Calculate which fingers are extended using improved logic"""
        fingers_up = []

        # Thumb detection (more sophisticated)
        thumb_extended = self._is_thumb_extended(landmarks)
        fingers_up.append(1 if thumb_extended else 0)

        # Other fingers detection
        finger_indices = [
            (8, 6, 5),   # Index: tip, pip, mcp
            (12, 10, 9), # Middle: tip, pip, mcp
            (16, 14, 13), # Ring: tip, pip, mcp
            (20, 18, 17)  # Pinky: tip, pip, mcp
        ]

        for tip_idx, pip_idx, mcp_idx in finger_indices:
            extended = self._is_finger_extended(landmarks, tip_idx, pip_idx, mcp_idx)
            fingers_up.append(1 if extended else 0)

        return fingers_up

    def _is_thumb_extended(self, landmarks: List[List[float]]) -> bool:
        """Check if thumb is extended using multiple criteria"""
        thumb_tip = landmarks[4]
        thumb_ip = landmarks[3]
        thumb_mcp = landmarks[2]
        wrist = landmarks[0]

        # Check if thumb tip is away from palm
        thumb_distance = np.linalg.norm(np.array(thumb_tip) - np.array(wrist))
        palm_size = np.linalg.norm(np.array(thumb_mcp) - np.array(wrist))

        # Thumb extended if tip is significantly away from palm
        if thumb_distance > palm_size * 0.8:
            return True

        # Alternative check: thumb tip position relative to index finger
        index_mcp = landmarks[5]
        if abs(thumb_tip[0] - index_mcp[0]) > 0.1:  # Significant horizontal separation
            return True

        return False

    def _is_finger_extended(self, landmarks: List[List[float]], tip_idx: int, pip_idx: int, mcp_idx: int) -> bool:
        """Check if a finger is extended using knuckle positions"""
        tip = landmarks[tip_idx]
        pip = landmarks[pip_idx]
        mcp = landmarks[mcp_idx]

        # Calculate distances
        tip_to_pip = np.linalg.norm(np.array(tip) - np.array(pip))
        pip_to_mcp = np.linalg.norm(np.array(pip) - np.array(mcp))

        # Finger is extended if tip is far from MCP (knuckle)
        tip_to_mcp = np.linalg.norm(np.array(tip) - np.array(mcp))

        # Extended if tip is higher than PIP and sufficiently far from MCP
        if tip[1] < pip[1] and tip_to_mcp > pip_to_mcp * 1.2:
            return True

        return False
    
        return False

    def _determine_gesture_from_fingers_enhanced(self, fingers_up: List[int], landmarks: List[List[float]]) -> Tuple[str, float]:
        """Enhanced gesture determination with better accuracy and confidence scoring"""
        finger_count = sum(fingers_up)

        # Rock: Fist - all fingers curled (0-1 fingers up)
        if finger_count <= 1:
            # Verify it's actually a fist by checking finger positions
            if self._is_fist(landmarks):
                return "rock", 0.92
            else:
                return "rock", 0.75  # Less confident if not clearly a fist

        # Paper: Open hand - all fingers extended (4-5 fingers up)
        elif finger_count >= 4:
            # Verify palm is relatively flat
            if self._is_open_palm(landmarks):
                return "paper", 0.95
            else:
                return "paper", 0.80

        # Scissors: Index and middle fingers extended, others curled
        elif finger_count == 2:
            if fingers_up[1] == 1 and fingers_up[2] == 1:  # Index and middle up
                # Check if ring and pinky are curled
                if fingers_up[3] == 0 and fingers_up[4] == 0:
                    # Verify scissors formation (fingers close together)
                    if self._are_fingers_close(landmarks, 8, 12):  # Index and middle tips
                        return "scissors", 0.90
                    else:
                        return "scissors", 0.75
                else:
                    return "scissors", 0.60  # Some uncertainty

        # Ambiguous cases - try to classify based on most likely gesture
        elif finger_count == 3:
            # Could be paper with one finger slightly curled, or scissors with extra finger
            if fingers_up[1] == 1 and fingers_up[2] == 1:  # Index and middle up
                return "scissors", 0.55  # Possible scissors with extra finger
            else:
                return "paper", 0.50   # Possible paper with curled finger

        # Very uncertain - no clear gesture
        return "none", 0.2

    def _is_fist(self, landmarks: List[List[float]]) -> bool:
        """Check if hand is in fist formation"""
        # Check if fingertips are close to palm
        wrist = landmarks[0]
        fingertips = [landmarks[4], landmarks[8], landmarks[12], landmarks[16], landmarks[20]]

        palm_center = np.mean([landmarks[0], landmarks[5], landmarks[9], landmarks[13], landmarks[17]], axis=0)

        # Most fingertips should be close to palm center
        close_fingers = 0
        for tip in fingertips:
            distance = np.linalg.norm(np.array(tip) - palm_center)
            if distance < 0.15:  # Within reasonable distance
                close_fingers += 1

        return close_fingers >= 4  # At least 4 fingers close to palm

    def _is_open_palm(self, landmarks: List[List[float]]) -> bool:
        """Check if hand is open with palm relatively flat"""
        # Check finger spread and extension
        fingertips = [landmarks[4], landmarks[8], landmarks[12], landmarks[16], landmarks[20]]

        # Calculate spread (distance between thumb and pinky)
        thumb_pinky_distance = np.linalg.norm(np.array(landmarks[4]) - np.array(landmarks[20]))

        # Calculate average finger extension
        wrist = landmarks[0]
        avg_extension = np.mean([np.linalg.norm(np.array(tip) - wrist) for tip in fingertips])

        # Open palm if good spread and extension
        return thumb_pinky_distance > 0.25 and avg_extension > 0.4

    def _are_fingers_close(self, landmarks: List[List[float]], idx1: int, idx2: int) -> bool:
        """Check if two fingertips are close together (for scissors)"""
        tip1 = landmarks[idx1]
        tip2 = landmarks[idx2]
        distance = np.linalg.norm(np.array(tip1) - np.array(tip2))
        return distance < 0.08  # Close enough for scissors
    
    def process_video_frame(self, frame: np.ndarray) -> Dict[str, Any]:
        """Process a video frame for gesture recognition"""
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.hands.process(rgb_frame)
        
        if results.multi_hand_landmarks:
            hand_landmarks = results.multi_hand_landmarks[0]
            landmarks = self._extract_landmarks(hand_landmarks)
            gesture, confidence = self._classify_gesture(landmarks)
            
            # Draw landmarks on frame
            annotated_frame = frame.copy()
            self.mp_draw.draw_landmarks(
                annotated_frame, hand_landmarks, self.mp_hands.HAND_CONNECTIONS)
            
            return {
                "gesture": gesture,
                "confidence": confidence,
                "landmarks": landmarks,
                "annotated_frame": annotated_frame,
                "detected": True
            }
        
        return {
            "gesture": "none",
            "confidence": 0.0,
            "landmarks": [],
            "annotated_frame": frame,
            "detected": False
        }
    
    def get_gesture_feedback(self, gesture: str, confidence: float) -> Dict[str, Any]:
        """Get feedback for gesture recognition quality"""
        feedback = {
            "status": "unknown",
            "message": "No gesture detected",
            "color": "gray"
        }
        
        if gesture == "none":
            feedback = {
                "status": "no_gesture",
                "message": "Show your hand clearly",
                "color": "orange"
            }
        elif confidence < 0.5:
            feedback = {
                "status": "low_confidence", 
                "message": f"Detected {gesture} but unclear - try again",
                "color": "yellow"
            }
        elif confidence < 0.7:
            feedback = {
                "status": "medium_confidence",
                "message": f"Good! Detected {gesture}",
                "color": "lightblue"
            }
        else:
            feedback = {
                "status": "high_confidence",
                "message": f"Perfect! Clear {gesture} detected",
                "color": "green"
            }
        
        return feedback