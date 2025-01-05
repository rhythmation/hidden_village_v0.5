import PoseDrawer from './PoseDrawer';
import { useState, useEffect, useMemo } from "react";
import { matchSegmentToLandmarks, segmentSimilarity } from './PoseDrawingUtils';
import { enrichLandmarks } from './LandmarkUtils';

export function PoseMatch({
    posesToMatch = null,
    poseData = null
}) {
    const [poseToMatch, setPoseToMatch] = useState(null);
    const [similarityScores, setSimilarityScores] = useState([]);
    const matchConfig = [
        {"segment": "RIGHT_BICEP", "data": "poseLandmarks"}, 
        {"segment": "RIGHT_FOREARM", "data": "poseLandmarks"},
        {"segment": "LEFT_BICEP", "data": "poseLandmarks"}, 
        {"segment": "LEFT_FOREARM", "data": "poseLandmarks"}
    ];

    const width = 400;
    const height = 600;

    // Set initial pose to match when posesToMatch changes
    useEffect(() => {
        if (posesToMatch && posesToMatch.length > 0) {
            setPoseToMatch(posesToMatch[0]);
        }
    }, [posesToMatch]);

    // Calculate pose similarity when poseData or poseToMatch changes
    useEffect(() => {
        if (!poseData || !poseToMatch) return;

        const enrichedPoseData = enrichLandmarks(poseData);
        const enrichedPoseToMatch = enrichLandmarks(poseToMatch);

        const newSimilarityScores = matchConfig.map(config => {
            const playerSegment = matchSegmentToLandmarks(
                config,
                enrichedPoseData,
                { width, height }
            );
            const modelSegment = matchSegmentToLandmarks(
                config,
                enrichedPoseToMatch,
                { width, height }
            );

            if (!playerSegment || !modelSegment) {
                return {
                    segment: config.segment,
                    similarityScore: 0
                };
            }

            return {
                segment: config.segment,
                similarityScore: segmentSimilarity(playerSegment, modelSegment)
            };
        });

        setSimilarityScores(newSimilarityScores);
    }, [poseData, poseToMatch]);

    // Calculate overall similarity score
    const overallSimilarity = useMemo(() => {
        if (similarityScores.length === 0) return 0;
        const validScores = similarityScores
            .map(score => score.similarityScore)
            .filter(score => !isNaN(score));
        if (validScores.length === 0) return 0;
        return validScores.reduce((acc, curr) => acc + curr, 0) / validScores.length;
    }, [similarityScores]);

    // Handle pose cycling
    const cycleToNextPose = () => {
        if (!posesToMatch) return;
        const currentIndex = posesToMatch.findIndex(pose => pose === poseToMatch);
        const nextIndex = (currentIndex + 1) % posesToMatch.length;
        setPoseToMatch(posesToMatch[nextIndex]);
    };

    return (
        <div className="pose-match-container">
            {poseToMatch ? (
                <>
                    <div className="pose-display">
                        <PoseDrawer
                            poseData={poseData}
                            width={width}
                            height={height}
                            similarityScores={similarityScores}
                        />
                    </div>
                    <div className="similarity-scores">
                        {similarityScores.map(({segment, similarityScore}) => (
                            <div key={segment} className="score-item">
                                <span>{segment}:</span>
                                <span>{similarityScore.toFixed(1)}%</span>
                            </div>
                        ))}
                        <div className="overall-score">
                            <span>Overall Similarity:</span>
                            <span>{overallSimilarity.toFixed(1)}%</span>
                        </div>
                    </div>
                    {posesToMatch.length > 1 && (
                        <button 
                            className="next-pose-btn"
                            onClick={cycleToNextPose}
                        >
                            Next Pose
                        </button>
                    )}
                </>
            ) : (
                <p>Pose data not available</p>
            )}
        </div>
    );
}