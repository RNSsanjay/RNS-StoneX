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
            min_detection_confidence=0.7,
            min_tracking_confidence=0.5
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
            
            # Convert BGR to RGB
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
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
    
    def _classify_gesture(self, landmarks: List[List[float]]) -> Tuple[str, float]:
        """
        Classify the gesture based on hand landmarks
        Returns: (gesture_name, confidence_score)
        """
        if len(landmarks) < 21:  # MediaPipe returns 21 landmarks
            return "none", 0.0
        
        # Key landmark indices
        thumb_tip = landmarks[4]
        thumb_ip = landmarks[3]
        index_tip = landmarks[8]
        index_pip = landmarks[6]
        middle_tip = landmarks[12]
        middle_pip = landmarks[10]
        ring_tip = landmarks[16]
        ring_pip = landmarks[14]
        pinky_tip = landmarks[20]
        pinky_pip = landmarks[18]
        
        # Calculate finger states (extended or not)
        fingers_up = []
        
        # Thumb (special case - compare x coordinates)
        if thumb_tip[0] > thumb_ip[0]:  # Thumb extended
            fingers_up.append(1)
        else:
            fingers_up.append(0)
        
        # Other fingers (compare y coordinates)
        finger_tips = [index_tip, middle_tip, ring_tip, pinky_tip]
        finger_pips = [index_pip, middle_pip, ring_pip, pinky_pip]
        
        for tip, pip in zip(finger_tips, finger_pips):
            if tip[1] < pip[1]:  # Finger extended (tip above pip)
                fingers_up.append(1)
            else:
                fingers_up.append(0)
        
        # Classify based on finger states
        gesture, confidence = self._determine_gesture_from_fingers(fingers_up, landmarks)
        
        return gesture, confidence
    
    def _determine_gesture_from_fingers(self, fingers_up: List[int], landmarks: List[List[float]]) -> Tuple[str, float]:
        """Determine gesture based on which fingers are extended"""
        
        # Rock: All fingers down (fist)
        if sum(fingers_up) <= 1:  # Allow for some detection noise
            return "rock", 0.85
        
        # Paper: All fingers extended
        if sum(fingers_up) >= 4:
            return "paper", 0.9
        
        # Scissors: Index and middle fingers extended
        if fingers_up[1] == 1 and fingers_up[2] == 1 and sum(fingers_up[3:]) == 0:
            return "scissors", 0.88
        
        # Additional scissors detection (more flexible)
        if fingers_up[1] == 1 and fingers_up[2] == 1 and sum(fingers_up) == 2:
            return "scissors", 0.75
        
        # If none match clearly, try to guess based on finger count
        finger_count = sum(fingers_up)
        
        if finger_count <= 1:
            return "rock", 0.6
        elif finger_count >= 4:
            return "paper", 0.6
        elif finger_count == 2:
            return "scissors", 0.5
        else:
            return "none", 0.3
    
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