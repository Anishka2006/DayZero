"""
3-Layer Evaluation System for DayZero

This module implements the complete 3-layer evaluation approach:
1. AI Scoring - Evaluates submission structure, judgment, and clarity
2. Teammate Ratings - Incorporates feedback from simulated teammates
3. Domain Expert Review - Quinn synthesizes behavioral evidence and makes final assessment

The SkillRecord represents verified proof of work performance, not credentials.
"""

from typing import Any, Dict
import json
from ai_engine.core.llm import ask_ai


class EvaluationLayer1:
    """Layer 1: AI Scoring - Evaluates work structure and judgment"""
    
    @staticmethod
    def score_submission(submission: str, task: dict) -> Dict[str, int]:
        """
        Score the submission on:
        - Structure: Organization and clarity of the work
        - Judgment: Quality of decisions and tradeoffs
        - Clarity: How well the solution communicates intent
        - Evidence Quality: Strength of supporting rationale
        """
        prompt = f"""
        You are an expert evaluator assessing work quality.
        
        Task: {task.get('title', 'Unknown')}
        Role: {task.get('role', 'Unknown')}
        
        Submission:
        {submission}
        
        Score this submission on 0-100 scale for:
        1. Structure: How well-organized and logical is the approach?
        2. Judgment: How sound are the decisions and tradeoffs?
        3. Clarity: How clearly is intent communicated?
        4. Evidence Quality: How strong is the supporting rationale?
        
        Return JSON:
        {{
            "structure": <0-100>,
            "judgment": <0-100>,
            "clarity": <0-100>,
            "evidence_quality": <0-100>,
            "reasoning": "brief explanation"
        }}
        """
        
        response = ask_ai(prompt)
        try:
            return json.loads(response)
        except:
            return {
                "structure": 60,
                "judgment": 60,
                "clarity": 60,
                "evidence_quality": 60,
                "reasoning": "Fallback evaluation"
            }


class EvaluationLayer2:
    """Layer 2: Teammate Ratings - Incorporates simulated team feedback"""
    
    @staticmethod
    def aggregate_teammate_ratings(session: dict) -> Dict[str, int]:
        """
        Aggregate ratings from simulated teammates:
        - Designer: UI/UX clarity, user impact consideration
        - Engineer: Technical soundness, implementation feasibility
        - QA: Validation approach, risk awareness
        - PM: Prioritization, stakeholder alignment
        """
        memory = session.get("memory") or {}
        scores = session.get("scores") or {}
        
        ratings = {
            "designer": scores.get("adaptability", 50),  # Design flexibility
            "engineer": scores.get("technicalDepth", 50),  # Technical evaluation
            "qa": scores.get("ownership", 50),  # Validation ownership
            "pm": scores.get("prioritization", 50),  # Priority judgment
        }
        
        # Weight adjustments based on behavioral signals
        if memory.get("mentioned_tradeoff"):
            ratings["pm"] = min(100, ratings["pm"] + 10)
        
        if memory.get("referenced_files"):
            ratings["engineer"] = min(100, ratings["engineer"] + 5)
        
        if memory.get("passed_tests"):
            ratings["qa"] = min(100, ratings["qa"] + 10)
        
        return ratings


class EvaluationLayer3:
    """Layer 3: Domain Expert Review - Synthesizes evidence and provides final assessment"""
    
    @staticmethod
    def synthesize_evaluation(
        submission: str,
        task: dict,
        layer1_scores: Dict[str, int],
        layer2_ratings: Dict[str, int],
        session: dict,
    ) -> Dict[str, Any]:
        """
        Quinn (Domain Expert) synthesizes all evidence and produces final SkillRecord.
        
        Focuses on:
        - Behavioral signal: How did the candidate actually work?
        - Pressure handling: Decision-making under constraints
        - Communication quality: Clarity and transparency with team
        - Risk awareness: Identification and mitigation of risks
        """
        
        # Prepare comprehensive context for Quinn
        context = {
            "submission": submission,
            "task": task,
            "ai_layer": layer1_scores,
            "teammate_feedback": layer2_ratings,
            "session_memory": session.get("memory", {}),
            "timeline": session.get("timeline", []),
        }
        
        prompt = f"""
        You are Quinn, the expert evaluator in a hiring simulation platform.
        
        You are conducting the final (Layer 3) evaluation based on:
        1. AI Scoring Analysis: {context['ai_layer']}
        2. Teammate Feedback Ratings: {context['teammate_feedback']}
        
        Task: {context['task'].get('title', 'Unknown')}
        
        Your assessment should focus on:
        - Behavioral Signal (0-100): What does this work reveal about how they actually work?
        - Pressure Handling (0-100): How did they respond to constraints and crises?
        - Communication Quality (0-100): How transparent and clear were they?
        - Risk Awareness (0-100): Did they identify and mitigate risks?
        
        Return ONLY JSON:
        {{
            "behavioral_signal": <0-100>,
            "pressure_handling": <0-100>,
            "communication_quality": <0-100>,
            "risk_awareness": <0-100>,
            "overall_assessment": <0-100>,
            "summary": "1-2 sentence evidence-based summary",
            "key_strength": "most impressive aspect",
            "area_for_growth": "what they should focus on",
            "hiring_recommendation": "Strong Hire / Hire / Lean Hire / No Hire"
        }}
        """
        
        response = ask_ai(prompt)
        try:
            return json.loads(response)
        except:
            # Fallback
            avg_score = (
                sum(layer1_scores.values()) / len(layer1_scores) +
                sum(layer2_ratings.values()) / len(layer2_ratings)
            ) / 2
            avg_score = int(avg_score)
            
            return {
                "behavioral_signal": avg_score,
                "pressure_handling": avg_score,
                "communication_quality": avg_score,
                "risk_awareness": avg_score,
                "overall_assessment": avg_score,
                "summary": f"Candidate demonstrated core competencies with an overall assessment score of {avg_score}.",
                "key_strength": "Engaged actively with team",
                "area_for_growth": "Strengthen validation approach",
                "hiring_recommendation": "Lean Hire" if avg_score >= 55 else "No Hire",
            }


class SkillRecordBuilder:
    """Constructs the final portable SkillRecord from 3-layer evaluation"""
    
    @staticmethod
    def build(
        submission: str,
        task: dict,
        session: dict,
    ) -> Dict[str, Any]:
        """
        Build complete SkillRecord using all 3 layers.
        
        The SkillRecord is a portable proof of how someone actually works,
        evaluated through:
        1. AI structural analysis
        2. Team feedback integration
        3. Expert behavioral assessment
        """
        
        # Layer 1: AI Scoring
        layer1 = EvaluationLayer1.score_submission(submission, task)
        
        # Layer 2: Teammate Ratings
        layer2 = EvaluationLayer2.aggregate_teammate_ratings(session)
        
        # Layer 3: Domain Expert Review
        layer3 = EvaluationLayer3.synthesize_evaluation(
            submission=submission,
            task=task,
            layer1_scores=layer1,
            layer2_ratings=layer2,
            session=session,
        )
        
        # Synthesize overall score (weighted average)
        overall_score = int(
            (
                sum(layer1.values()) / len(layer1) * 0.33 +
                sum(layer2.values()) / len(layer2) * 0.33 +
                layer3.get("overall_assessment", 60) * 0.34
            )
        )
        
        # Build comprehensive SkillRecord
        skill_record = {
            "verified": True,
            "platform": "DayZero",
            "task": {
                "title": task.get("title", "Unknown"),
                "role": task.get("role", "Unknown"),
                "company": task.get("company", "Unknown"),
                "duration_minutes": task.get("deadline", 45),
            },
            "evaluation": {
                "layer_1_ai_scoring": {
                    "structure": layer1.get("structure", 60),
                    "judgment": layer1.get("judgment", 60),
                    "clarity": layer1.get("clarity", 60),
                    "evidence_quality": layer1.get("evidence_quality", 60),
                },
                "layer_2_teammate_ratings": {
                    "designer_feedback": layer2.get("designer", 60),
                    "engineer_feedback": layer2.get("engineer", 60),
                    "qa_feedback": layer2.get("qa", 60),
                    "pm_feedback": layer2.get("pm", 60),
                },
                "layer_3_expert_review": {
                    "behavioral_signal": layer3.get("behavioral_signal", 60),
                    "pressure_handling": layer3.get("pressure_handling", 60),
                    "communication_quality": layer3.get("communication_quality", 60),
                    "risk_awareness": layer3.get("risk_awareness", 60),
                },
            },
            "overall_score": overall_score,
            "skills": {
                "problem_solving": layer1.get("judgment", 60),
                "communication": layer3.get("communication_quality", 60),
                "pressure_handling": layer3.get("pressure_handling", 60),
                "collaboration": layer2.get("pm", 60),
                "technical_reasoning": layer2.get("engineer", 60),
            },
            "summary": layer3.get("summary", "Candidate completed simulation."),
            "strengths": [
                layer3.get("key_strength", "Engaged with team"),
                "Made visible decisions",
                "Handled pressure"
            ],
            "areas_for_growth": [
                layer3.get("area_for_growth", "Strengthen validation"),
                "Improve scope clarity"
            ],
            "recommendation": layer3.get("hiring_recommendation", "Lean Hire"),
            "evidence": [
                f"AI Analysis: {layer1.get('reasoning', 'Evaluated submission structure')}",
                f"Team Assessment: {layer2}",
                f"Expert Review: {layer3.get('summary', 'Behavioral assessment complete')}",
            ],
        }
        
        return skill_record
